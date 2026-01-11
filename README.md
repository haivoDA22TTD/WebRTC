# 🎥 WebRTC Video Meeting Platform

Ứng dụng họp video trực tuyến với kiến trúc Microservices, tích hợp AI Bot thông minh.

![Tech Stack](https://img.shields.io/badge/React-19-blue) ![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.7-green) ![Python](https://img.shields.io/badge/Python-3.11-yellow) ![Docker](https://img.shields.io/badge/Docker-Compose-blue)

> ⚠️ **CẢNH BÁO**: Dự án này đang trong giai đoạn **THỬ NGHIỆM (Beta)**. Một số tính năng có thể chưa ổn định hoặc đang được phát triển. Không khuyến khích sử dụng cho môi trường production.

## ✨ Tính năng chính

### 🎬 Video Conference
- Gọi video/audio peer-to-peer với WebRTC
- Chia sẻ màn hình
- Bật/tắt camera và microphone
- Hỗ trợ nhiều người tham gia cùng lúc
- Giao diện Discord-like, responsive

### 💬 Chat trong cuộc họp
- Nhắn tin real-time trong phòng họp
- Lưu trữ lịch sử tin nhắn
- Thông báo khi có người vào/rời phòng

### 🤖 AI Bot Assistant
- Trợ lý AI tham gia cuộc họp như người dùng thật
- Trả lời câu hỏi thông minh (Gemini/OpenAI/Ollama)
- Avatar anime hoạt hình
- Text-to-Speech tiếng Việt

### 👤 Quản lý người dùng
- Đăng ký/Đăng nhập với JWT
- Hỗ trợ OAuth2
- Quản lý profile và avatar
- Mời người dùng qua email

### 📊 Analytics
- Thống kê cuộc họp
- Theo dõi số người tham gia
- Lịch sử hoạt động

## 🏗️ Kiến trúc hệ thống

```
                                    ┌─────────────────┐
                                    │    Frontend     │
                                    │  React + Vite   │
                                    │     :5173       │
                                    └────────┬────────┘
                                             │
                                    ┌────────▼────────┐
                                    │     Gateway     │
                                    │  Spring Cloud   │
                                    │     :8080       │
                                    └────────┬────────┘
                                             │
        ┌────────────────┬───────────────────┼───────────────────┬────────────────┐
        │                │                   │                   │                │
┌───────▼───────┐ ┌──────▼──────┐ ┌─────────▼─────────┐ ┌───────▼───────┐ ┌──────▼──────┐
│     Auth      │ │    Room     │ │    Signaling      │ │     Chat      │ │   Profile   │
│    :8081      │ │   :8082     │ │  WebSocket:8083   │ │    :8084      │ │   :8085     │
└───────┬───────┘ └──────┬──────┘ └─────────┬─────────┘ └───────┬───────┘ └──────┬──────┘
        │                │                   │                   │                │
        └────────────────┴───────────────────┼───────────────────┴────────────────┘
                                             │
        ┌────────────────┬───────────────────┼───────────────────┬────────────────┐
        │                │                   │                   │                │
┌───────▼───────┐ ┌──────▼──────┐ ┌─────────▼─────────┐ ┌───────▼───────┐ ┌──────▼──────┐
│   MongoDB     │ │    Redis    │ │      Kafka        │ │   AI Bot      │ │   coturn    │
│   :27017      │ │   :6379     │ │      :9092        │ │   :8088       │ │   :3478     │
└───────────────┘ └─────────────┘ └───────────────────┘ └───────────────┘ └─────────────┘
```

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19 | UI Framework |
| TypeScript | 5.x | Type Safety |
| Vite | 7.x | Build Tool |
| Tailwind CSS | 4.x | Styling |
| Zustand | 5.x | State Management |
| Axios | 1.x | HTTP Client |

### Backend (Java)
| Technology | Version | Purpose |
|------------|---------|---------|
| Spring Boot | 3.3.7 | Framework |
| Spring Cloud | 2023.0.4 | Microservices |
| Spring Security | - | Authentication |
| MongoDB | 7 | Database |
| Redis | 7 | Cache |
| Kafka | 7.5 | Message Queue |

### AI Bot (Python)
| Technology | Version | Purpose |
|------------|---------|---------|
| aiortc | 1.9.0 | WebRTC Client |
| OpenCV | 4.9.0 | Video Processing |
| edge-tts | 6.1.9 | Text-to-Speech |
| Gemini/OpenAI | - | AI Response |

## 📦 Services

| Service | Port | Mô tả |
|---------|------|-------|
| Frontend | 5173 | Giao diện React |
| Gateway | 8080 | API Gateway |
| Eureka | 8761 | Service Discovery |
| Auth | 8081 | Xác thực JWT |
| Room | 8082 | Quản lý phòng họp |
| Signaling | 8083 | WebRTC Signaling |
| Chat | 8084 | Chat trong phòng |
| Profile | 8085 | Hồ sơ người dùng |
| Notification | 8086 | Thông báo email |
| Analytics | 8087 | Thống kê |
| AI Bot | 8088 | Trợ lý AI |
| SFU | 4000 | Media Server |

## 🚀 Cài đặt và Chạy

### Yêu cầu
- Docker & Docker Compose
- Node.js 18+ (nếu chạy local)
- Java 17+ (nếu chạy local)
- Python 3.11+ (nếu chạy local)

### 1. Clone repository
```bash
git clone https://github.com/haivoDA22TTD/WebRTC
cd WebRTC
```

### 2. Cấu hình môi trường
```bash
cp .env.example .env
```

Chỉnh sửa file `.env`:
```env
# Email (Gmail App Password)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=xxxx-xxxx-xxxx-xxxx

# TURN Server
TURN_REALM=webrtc.local
TURN_SECRET=webrtc-secret-key

# SFU
SFU_ANNOUNCED_IP=127.0.0.1

# AI Bot (Google Gemini - FREE)
GEMINI_API_KEY=your-gemini-api-key
```

### 3. Chạy với Docker Compose

**Chạy tất cả services:**
```bash
docker-compose up -d
```

**Chạy từng phần:**
```bash
# Infrastructure
docker-compose up -d mongodb redis kafka zookeeper

# Backend services
docker-compose up -d eureka-server gateway auth-service room-service signaling-service chat-service

# Frontend & AI Bot
docker-compose up -d frontend ai-bot
```

### 4. Truy cập ứng dụng
- **Frontend**: http://localhost:5173
- **Eureka Dashboard**: http://localhost:8761
- **Mailhog (Email test)**: http://localhost:8025

## 📖 Hướng dẫn sử dụng

### Tạo phòng họp
1. Đăng ký/Đăng nhập tài khoản
2. Click "Tạo phòng họp"
3. Chia sẻ mã phòng cho người khác

### Tham gia phòng họp
1. Nhập mã phòng hoặc click link mời
2. Cho phép truy cập camera/microphone
3. Bắt đầu cuộc họp

### Mời AI Bot
1. Trong phòng họp, click "Mời"
2. Chọn "Mời AI Bot"
3. AI Assistant sẽ tham gia và trả lời câu hỏi

### Các phím tắt
| Phím | Chức năng |
|------|-----------|
| M | Bật/tắt microphone |
| V | Bật/tắt camera |
| S | Chia sẻ màn hình |
| C | Mở/đóng chat |

## 🔧 Development

### Chạy Frontend local
```bash
cd frontend
npm install
npm run dev
```

### Chạy Backend local
```bash
# Mỗi service trong terminal riêng
cd auth && ./mvnw spring-boot:run
cd room && ./mvnw spring-boot:run
cd signaling && ./mvnw spring-boot:run
cd chat && ./mvnw spring-boot:run
```

### Chạy AI Bot local
```bash
cd ai-bot
pip install -r requirements.txt
python server.py
```

## 🔐 API Endpoints

### Auth Service (8081)
```
POST /auth/register    - Đăng ký
POST /auth/login       - Đăng nhập
POST /auth/logout      - Đăng xuất
GET  /auth/me          - Thông tin user
```

### Room Service (8082)
```
POST /rooms            - Tạo phòng
POST /rooms/join/:code - Tham gia phòng
GET  /rooms/:id        - Thông tin phòng
POST /rooms/:id/leave  - Rời phòng
POST /rooms/:id/invite - Mời qua email
```

### AI Bot (8088)
```
POST /bot/join         - Mời bot vào phòng
POST /bot/leave        - Bot rời phòng
GET  /bot/status       - Trạng thái bot
GET  /health           - Health check
```

## 📁 Cấu trúc thư mục

```
webrtc-meeting/
├── frontend/          # React Frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── stores/
│   │   └── types/
│   └── package.json
├── auth/              # Auth Service (Spring Boot)
├── room/              # Room Service
├── signaling/         # Signaling Service
├── chat/              # Chat Service
├── profile/           # Profile Service
├── notification/      # Notification Service
├── analytics/         # Analytics Service
├── gateway/           # API Gateway
├── eureka-server/     # Service Discovery
├── ai-bot/            # AI Bot (Python)
│   ├── src/
│   │   ├── bot.py
│   │   ├── chatbot.py
│   │   ├── video_generator.py
│   │   └── webrtc_client.py
│   └── requirements.txt
├── sfu/               # Media Server (mediasoup)
├── coturn/            # TURN Server config
├── docker-compose.yml
└── .env.example
```

## 🐛 Troubleshooting

### Camera không hoạt động
- Kiểm tra quyền truy cập camera trong browser
- Đảm bảo không có ứng dụng khác đang dùng camera
- Thử với browser khác (Chrome recommended)

### Không kết nối được video
- Kiểm tra TURN server đang chạy
- Kiểm tra firewall không chặn port UDP
- Xem console log để debug WebRTC

### AI Bot không trả lời
- Kiểm tra GEMINI_API_KEY trong .env
- Xem logs: `docker logs webrtc-ai-bot`
- Đảm bảo bot đã join room thành công

## 📄 License

MIT License


---

⭐ Nếu thấy hữu ích, hãy star repo này!
