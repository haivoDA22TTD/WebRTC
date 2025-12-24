# 🎥 HỆ THỐNG WEBRTC GIAO TIẾP THỜI GIAN THỰC

> Hệ thống giao tiếp thời gian thực dựa trên **WebRTC**, được xây dựng theo **kiến trúc Microservices**, hỗ trợ nhắn tin realtime, gọi video/audio, quản lý phòng và xác thực người dùng.

![WebRTC](https://img.shields.io/badge/WebRTC-Realtime-green)
![Microservices](https://img.shields.io/badge/Kiến%20trúc-Microservices-blue)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-Backend-brightgreen)
![React](https://img.shields.io/badge/React-Frontend-61DAFB)
![Docker](https://img.shields.io/badge/Docker-Container-2496ED)
![CI/CD](https://img.shields.io/badge/GitHub%20Actions-CI%2FCD-black)

---

## 📌 Giới thiệu

Đây là một **ứng dụng WebRTC giao tiếp thời gian thực**, cho phép người dùng:

- Nhắn tin realtime
- Gọi video / audio
- Tạo và tham gia phòng
- Quản lý thông tin cá nhân
- Xác thực và phân quyền người dùng

Hệ thống được thiết kế theo **mô hình Microservices**, dễ mở rộng, bảo trì và triển khai bằng **Docker** kết hợp **CI/CD GitHub Actions**.

---

## 🚀 Chức năng chính

- 🔐 **Xác thực & phân quyền người dùng**
- 💬 **Nhắn tin thời gian thực (WebSocket)**
- 🎥 **Gọi video / audio bằng WebRTC**
- 🏠 **Quản lý phòng (Room)**
- 👤 **Quản lý hồ sơ người dùng**
- 🌐 **API Gateway** trung tâm
- 🐳 **Triển khai bằng Docker**
- 🔁 **Tự động CI/CD**

---


### Mô tả:
- **Frontend**: Giao diện người dùng, xử lý media stream WebRTC
- **Signaling Service**: Trao đổi SDP & ICE Candidate
- **Chat Service**: Nhắn tin realtime
- **Auth Service**: Đăng nhập, xác thực JWT
- **API Gateway**: Điều hướng request
- **Các service hoạt động độc lập**

---

## 🛠️ Công nghệ sử dụng

### 🔹 Backend
- ☕ **Java**
- 🌱 **Spring Boot**
- 🔐 **Spring Security**
- 🌐 **WebSocket**
- 🎥 **WebRTC Signaling**
- 🐬 **MySQL**

### 🔹 Frontend
- ⚛️ **React**
- 📘 **TypeScript**
- 🎨 **CSS**

### 🔹 DevOps
- 🐳 **Docker & Docker Compose**
- 🔁 **GitHub Actions (CI/CD)**
- 🌐 **Nginx**

---

## 📂 Cấu trúc thư mục


---

## 📥 Hướng dẫn clone dự án

```bash
git clone https://github.com/haivoDA22TTD/WebRTC.git
cd WebRTC
```
## ▶️ Chạy ứng dụng bằng Docker
```bash
  docker-compose up --build
```
## Truy cập

🌐 Frontend: http://localhost:5173

🚪 API Gateway: http://localhost:8080

🔐 Luồng xác thực

## 📈 Hướng phát triển trong tương lai

📱 Hỗ trợ thiết bị di động

👥 Gọi nhóm nhiều người

📊 Monitoring (Prometheus, Grafana)

🔔 Notification Service

☁️ Triển khai Cloud (AWS / GCP)

## 👨‍💻 Tác giả
Võ Chí Hải(**haivoDev**)
## ⭐ Đóng góp

Nếu bạn thấy dự án hữu ích, hãy ⭐ Star repository để ủng hộ nhé!
