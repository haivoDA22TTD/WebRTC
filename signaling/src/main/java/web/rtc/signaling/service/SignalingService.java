package web.rtc.signaling.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import java.io.IOException;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class SignalingService {
    
    private final Map<String, WebSocketSession> sessions = new ConcurrentHashMap<>();
    private final Map<String, Set<String>> roomSessions = new ConcurrentHashMap<>();
    private final Map<String, String> sessionToRoom = new ConcurrentHashMap<>();
    private final Map<String, String> sessionToUser = new ConcurrentHashMap<>();
    
    @Nullable
    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public SignalingService(@Nullable KafkaTemplate<String, Object> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void addSession(WebSocketSession session) {
        sessions.put(session.getId(), session);
    }

    public void removeSession(WebSocketSession session) {
        String sessionId = session.getId();
        String roomId = sessionToRoom.get(sessionId);
        String userId = sessionToUser.get(sessionId);
        
        if (roomId != null) {
            Set<String> roomSessionIds = roomSessions.get(roomId);
            if (roomSessionIds != null) {
                roomSessionIds.remove(sessionId);
                // Notify others that user left
                broadcastToRoom(roomId, Map.of(
                    "type", "user-left",
                    "userId", userId != null ? userId : sessionId
                ), sessionId);
            }
        }
        
        sessions.remove(sessionId);
        sessionToRoom.remove(sessionId);
        sessionToUser.remove(sessionId);
    }

    public void handleJoin(WebSocketSession session, Map<String, Object> payload) {
        String roomId = (String) payload.get("roomId");
        String userId = (String) payload.get("userId");
        String displayName = (String) payload.get("displayName");
        
        String sessionId = session.getId();
        sessionToRoom.put(sessionId, roomId);
        sessionToUser.put(sessionId, userId);
        
        roomSessions.computeIfAbsent(roomId, k -> ConcurrentHashMap.newKeySet()).add(sessionId);
        
        // Get existing users in room
        Set<String> existingUsers = new HashSet<>();
        Set<String> roomSessionIds = roomSessions.get(roomId);
        if (roomSessionIds != null) {
            for (String sid : roomSessionIds) {
                if (!sid.equals(sessionId)) {
                    String uid = sessionToUser.get(sid);
                    if (uid != null) existingUsers.add(uid);
                }
            }
        }
        
        // Send existing users to new user
        sendToSession(session, Map.of(
            "type", "room-users",
            "users", existingUsers
        ));
        
        // Notify others about new user
        broadcastToRoom(roomId, Map.of(
            "type", "user-joined",
            "userId", userId,
            "displayName", displayName
        ), sessionId);
    }

    public void handleLeave(WebSocketSession session, Map<String, Object> payload) {
        removeSession(session);
    }

    public void handleOffer(WebSocketSession session, Map<String, Object> payload) {
        String targetId = (String) payload.get("targetId");
        String senderId = sessionToUser.get(session.getId());
        
        sendToUser(targetId, Map.of(
            "type", "offer",
            "senderId", senderId,
            "payload", payload.get("payload")
        ));
    }

    public void handleAnswer(WebSocketSession session, Map<String, Object> payload) {
        String targetId = (String) payload.get("targetId");
        String senderId = sessionToUser.get(session.getId());
        
        sendToUser(targetId, Map.of(
            "type", "answer",
            "senderId", senderId,
            "payload", payload.get("payload")
        ));
    }

    public void handleIceCandidate(WebSocketSession session, Map<String, Object> payload) {
        String targetId = (String) payload.get("targetId");
        String senderId = sessionToUser.get(session.getId());
        
        sendToUser(targetId, Map.of(
            "type", "ice-candidate",
            "senderId", senderId,
            "payload", payload.get("payload")
        ));
    }

    public void handleChat(WebSocketSession session, Map<String, Object> payload) {
        String roomId = sessionToRoom.get(session.getId());
        String senderId = sessionToUser.get(session.getId());
        
        Map<String, Object> message = new HashMap<>(payload);
        message.put("senderId", senderId);
        message.put("timestamp", System.currentTimeMillis());
        
        broadcastToRoom(roomId, Map.of(
            "type", "chat-message",
            "message", message
        ), null);
        
        // Send to Kafka for persistence (if available)
        if (kafkaTemplate != null) {
            kafkaTemplate.send("chat-messages", message);
        }
    }

    public void handleMediaStateChange(WebSocketSession session, Map<String, Object> payload, String mediaType) {
        String roomId = sessionToRoom.get(session.getId());
        String userId = sessionToUser.get(session.getId());
        
        broadcastToRoom(roomId, Map.of(
            "type", "media-state-change",
            "userId", userId,
            "mediaType", mediaType,
            "enabled", payload.get("enabled")
        ), session.getId());
    }

    private void broadcastToRoom(String roomId, Map<String, Object> message, String excludeSessionId) {
        Set<String> roomSessionIds = roomSessions.get(roomId);
        if (roomSessionIds == null) return;
        
        for (String sessionId : roomSessionIds) {
            if (excludeSessionId != null && sessionId.equals(excludeSessionId)) continue;
            WebSocketSession targetSession = sessions.get(sessionId);
            if (targetSession != null && targetSession.isOpen()) {
                sendToSession(targetSession, message);
            }
        }
    }

    private void sendToUser(String userId, Map<String, Object> message) {
        for (Map.Entry<String, String> entry : sessionToUser.entrySet()) {
            if (entry.getValue().equals(userId)) {
                WebSocketSession session = sessions.get(entry.getKey());
                if (session != null && session.isOpen()) {
                    sendToSession(session, message);
                }
                break;
            }
        }
    }

    private void sendToSession(WebSocketSession session, Map<String, Object> message) {
        try {
            session.sendMessage(new TextMessage(objectMapper.writeValueAsString(message)));
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
