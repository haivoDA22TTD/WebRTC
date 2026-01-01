const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mediasoup = require('mediasoup');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Mediasoup configuration
const config = {
  listenIps: [
    {
      ip: process.env.MEDIASOUP_LISTEN_IP || '0.0.0.0',
      announcedIp: process.env.MEDIASOUP_ANNOUNCED_IP || null,
    },
  ],
  mediaCodecs: [
    {
      kind: 'audio',
      mimeType: 'audio/opus',
      clockRate: 48000,
      channels: 2,
    },
    {
      kind: 'video',
      mimeType: 'video/VP8',
      clockRate: 90000,
      parameters: {
        'x-google-start-bitrate': 1000,
      },
    },
    {
      kind: 'video',
      mimeType: 'video/VP9',
      clockRate: 90000,
      parameters: {
        'profile-id': 2,
        'x-google-start-bitrate': 1000,
      },
    },
    {
      kind: 'video',
      mimeType: 'video/H264',
      clockRate: 90000,
      parameters: {
        'packetization-mode': 1,
        'profile-level-id': '4d0032',
        'level-asymmetry-allowed': 1,
        'x-google-start-bitrate': 1000,
      },
    },
  ],
  webRtcTransport: {
    maxIncomingBitrate: 1500000,
    initialAvailableOutgoingBitrate: 1000000,
  },
};

// State management
let worker;
const rooms = new Map();
const peers = new Map();

// Initialize mediasoup worker
async function createWorker() {
  worker = await mediasoup.createWorker({
    rtcMinPort: parseInt(process.env.RTC_MIN_PORT) || 40000,
    rtcMaxPort: parseInt(process.env.RTC_MAX_PORT) || 40100,
    logLevel: 'warn',
  });

  console.log(`Mediasoup worker created [pid:${worker.pid}]`);

  worker.on('died', () => {
    console.error('Mediasoup worker died, exiting...');
    process.exit(1);
  });

  return worker;
}

// Get or create room
async function getOrCreateRoom(roomId) {
  if (rooms.has(roomId)) {
    return rooms.get(roomId);
  }

  const router = await worker.createRouter({ mediaCodecs: config.mediaCodecs });
  const room = { router, peers: new Map() };
  rooms.set(roomId, room);
  
  console.log(`Room created: ${roomId}`);
  return room;
}

// Create WebRTC transport
async function createWebRtcTransport(router) {
  const transport = await router.createWebRtcTransport({
    listenIps: config.listenIps,
    enableUdp: true,
    enableTcp: true,
    preferUdp: true,
    initialAvailableOutgoingBitrate: config.webRtcTransport.initialAvailableOutgoingBitrate,
  });

  await transport.setMaxIncomingBitrate(config.webRtcTransport.maxIncomingBitrate);

  return {
    id: transport.id,
    iceParameters: transport.iceParameters,
    iceCandidates: transport.iceCandidates,
    dtlsParameters: transport.dtlsParameters,
    transport,
  };
}

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on('join-room', async ({ roomId, userId, displayName }, callback) => {
    try {
      const room = await getOrCreateRoom(roomId);
      
      const peer = {
        socketId: socket.id,
        odId,
        displayName,
        roomId,
        transports: new Map(),
        producers: new Map(),
        consumers: new Map(),
      };
      
      peers.set(socket.id, peer);
      room.peers.set(socket.id, peer);
      socket.join(roomId);

      const rtpCapabilities = room.router.rtpCapabilities;

      socket.to(roomId).emit('peer-joined', { odId, displayName });

      const existingPeers = [];
      room.peers.forEach((p, odId) => {
        if (odId !== socket.id) {
          existingPeers.push({
            odId,
            odId: p.odId,
            displayName: p.displayName,
            producers: Array.from(p.producers.keys()),
          });
        }
      });

      callback({ rtpCapabilities, existingPeers });
    } catch (error) {
      console.error('Error joining room:', error);
      callback({ error: error.message });
    }
  });

  socket.on('create-transport', async ({ direction }, callback) => {
    try {
      const peer = peers.get(socket.id);
      if (!peer) return callback({ error: 'Peer not found' });

      const room = rooms.get(peer.roomId);
      if (!room) return callback({ error: 'Room not found' });

      const { id, iceParameters, iceCandidates, dtlsParameters, transport } = 
        await createWebRtcTransport(room.router);

      peer.transports.set(id, { transport, direction });

      callback({ id, iceParameters, iceCandidates, dtlsParameters });
    } catch (error) {
      console.error('Error creating transport:', error);
      callback({ error: error.message });
    }
  });

  socket.on('connect-transport', async ({ transportId, dtlsParameters }, callback) => {
    try {
      const peer = peers.get(socket.id);
      if (!peer) return callback({ error: 'Peer not found' });

      const transportData = peer.transports.get(transportId);
      if (!transportData) return callback({ error: 'Transport not found' });

      await transportData.transport.connect({ dtlsParameters });
      callback({ success: true });
    } catch (error) {
      console.error('Error connecting transport:', error);
      callback({ error: error.message });
    }
  });

  socket.on('produce', async ({ transportId, kind, rtpParameters, appData }, callback) => {
    try {
      const peer = peers.get(socket.id);
      if (!peer) return callback({ error: 'Peer not found' });

      const transportData = peer.transports.get(transportId);
      if (!transportData) return callback({ error: 'Transport not found' });

      const producer = await transportData.transport.produce({
        kind,
        rtpParameters,
        appData,
      });

      peer.producers.set(producer.id, producer);

      producer.on('transportclose', () => {
        producer.close();
        peer.producers.delete(producer.id);
      });

      socket.to(peer.roomId).emit('new-producer', {
        odId: peer.odId,
        producerId: producer.id,
        kind,
      });

      callback({ id: producer.id });
    } catch (error) {
      console.error('Error producing:', error);
      callback({ error: error.message });
    }
  });

  socket.on('consume', async ({ producerId, rtpCapabilities }, callback) => {
    try {
      const peer = peers.get(socket.id);
      if (!peer) return callback({ error: 'Peer not found' });

      const room = rooms.get(peer.roomId);
      if (!room) return callback({ error: 'Room not found' });

      if (!room.router.canConsume({ producerId, rtpCapabilities })) {
        return callback({ error: 'Cannot consume' });
      }

      let consumerTransport;
      peer.transports.forEach((t) => {
        if (t.direction === 'recv') consumerTransport = t.transport;
      });

      if (!consumerTransport) {
        return callback({ error: 'No receive transport' });
      }

      const consumer = await consumerTransport.consume({
        producerId,
        rtpCapabilities,
        paused: true,
      });

      peer.consumers.set(consumer.id, consumer);

      consumer.on('transportclose', () => {
        consumer.close();
        peer.consumers.delete(consumer.id);
      });

      consumer.on('producerclose', () => {
        consumer.close();
        peer.consumers.delete(consumer.id);
        socket.emit('producer-closed', { consumerId: consumer.id });
      });

      callback({
        id: consumer.id,
        producerId,
        kind: consumer.kind,
        rtpParameters: consumer.rtpParameters,
      });
    } catch (error) {
      console.error('Error consuming:', error);
      callback({ error: error.message });
    }
  });

  socket.on('resume-consumer', async ({ consumerId }, callback) => {
    try {
      const peer = peers.get(socket.id);
      if (!peer) return callback({ error: 'Peer not found' });

      const consumer = peer.consumers.get(consumerId);
      if (!consumer) return callback({ error: 'Consumer not found' });

      await consumer.resume();
      callback({ success: true });
    } catch (error) {
      console.error('Error resuming consumer:', error);
      callback({ error: error.message });
    }
  });

  socket.on('close-producer', async ({ producerId }, callback) => {
    try {
      const peer = peers.get(socket.id);
      if (!peer) return callback({ error: 'Peer not found' });

      const producer = peer.producers.get(producerId);
      if (producer) {
        producer.close();
        peer.producers.delete(producerId);
      }

      callback({ success: true });
    } catch (error) {
      console.error('Error closing producer:', error);
      callback({ error: error.message });
    }
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
    
    const peer = peers.get(socket.id);
    if (peer) {
      peer.transports.forEach((t) => t.transport.close());
      
      const room = rooms.get(peer.roomId);
      if (room) {
        room.peers.delete(socket.id);
        socket.to(peer.roomId).emit('peer-left', { odId: peer.odId });
        
        if (room.peers.size === 0) {
          room.router.close();
          rooms.delete(peer.roomId);
          console.log(`Room closed: ${peer.roomId}`);
        }
      }
      
      peers.delete(socket.id);
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', rooms: rooms.size, peers: peers.size });
});

// Start server
const PORT = process.env.PORT || 4000;

createWorker().then(() => {
  server.listen(PORT, () => {
    console.log(`SFU server running on port ${PORT}`);
  });
});
