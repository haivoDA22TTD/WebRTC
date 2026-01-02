# WebRTC Video Meeting Application

Ứng dụng video meeting giống Google Meet với giao diện Discord, sử dụng WebRTC, React TypeScript, Spring Boot Microservices.

## Tech Stack

### Frontend
- React 19 + TypeScript + Vite
- Tailwind CSS
- Zustand (State Management)
- Socket.io Client
- WebRTC Native API

### Backend (Microservices)
- Spring Boot 3.5.9
- Spring Cloud (Eureka, Gateway)
- MongoDB
- Redis
- Apache Kafka
- WebSocket

## Architecture

```
┌─────────────┐     ┌─────────────┐
│   Frontend  │────▶│   Gateway   │
│  (React)    │     │   (8080)    │
└─────────────┘     └──────┬──────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│ Auth Service  │  │ Room Service  │  │ Chat Service  │
│    (8081)     │  │    (8082)     │  │    (8084)     │
└───────────────┘  └───────────────┘  └───────────────┘
        │                  │                  │
        ▼                  ▼                  ▼
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│   MongoDB     │  │    Redis      │  │    Kafka      │
└───────────────┘  └───────────────┘  └───────────────┘
                           │
                           ▼
                   ┌───────────────┐
                   │   Signaling   │
                   │    (8083)     │
                   └───────────────┘
```

## Services

| Service | Port | Description |
|---------|------|-------------|
| Gateway | 8080 | API Gateway + Eureka Server |
| Auth | 8081 | Authentication & Authorization |
| Room | 8082 | Room Management |
| Signaling | 8083 | WebRTC Signaling (WebSocket) |
| Chat | 8084 | In-call Chat |
| Profile | 8085 | User Profiles |
| Frontend | 5173 | React Application |

## Quick Start

### Development (Local)

1. Start infrastructure:
```bash
docker-compose up -d mongodb redis zookeeper kafka
```

2. Start backend services (in separate terminals):
```bash
cd gateway && ./mvnw spring-boot:run
cd auth && ./mvnw spring-boot:run
cd room && ./mvnw spring-boot:run
cd signaling && ./mvnw spring-boot:run
cd chat && ./mvnw spring-boot:run
cd profile && ./mvnw spring-boot:run
```

3. Start frontend:
```bash
cd frontend && npm run dev
```

### Docker (Production)

```bash
docker-compose up --build
```

Access: http://localhost:5173

## Features

- [x] User Authentication (Register/Login)
- [x] Create/Join Meeting Rooms
- [x] Video/Audio Calls (WebRTC)
- [x] Screen Sharing
- [x] In-call Chat
- [x] Mute/Unmute Audio
- [x] Enable/Disable Video
- [x] Participant List
- [x] Discord-like UI

## Environment Variables

Create `.env` file in frontend:
```
VITE_API_URL=http://localhost:8080/api
VITE_SOCKET_URL=http://localhost:8083
```
