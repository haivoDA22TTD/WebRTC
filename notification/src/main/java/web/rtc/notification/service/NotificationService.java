package web.rtc.notification.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import web.rtc.notification.dto.NotificationEvent;
import web.rtc.notification.model.Notification;
import web.rtc.notification.repository.NotificationRepository;
import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final WebSocketService webSocketService;
    private final EmailService emailService;
    private final ObjectMapper objectMapper;

    public NotificationService(
            NotificationRepository notificationRepository,
            WebSocketService webSocketService,
            EmailService emailService,
            ObjectMapper objectMapper) {
        this.notificationRepository = notificationRepository;
        this.webSocketService = webSocketService;
        this.emailService = emailService;
        this.objectMapper = objectMapper;
    }

    public Notification createNotification(NotificationEvent event) {
        Notification notification = new Notification(
            event.getUserId(),
            event.getType(),
            event.getTitle(),
            event.getMessage()
        );

        if (event.getData() != null) {
            try {
                notification.setData(objectMapper.writeValueAsString(event.getData()));
            } catch (Exception e) {
                // ignore
            }
        }

        notification = notificationRepository.save(notification);

        // Send push notification via WebSocket
        if (event.isSendPush()) {
            webSocketService.sendToUser(event.getUserId(), notification);
        }

        // Send email notification
        if (event.isSendEmail() && event.getData() != null && event.getData().containsKey("email")) {
            String email = (String) event.getData().get("email");
            emailService.sendNotificationEmail(email, event.getTitle(), event.getMessage());
        }

        return notification;
    }

    public Page<Notification> getUserNotifications(String userId, int page, int size) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(page, size));
    }

    public List<Notification> getUnreadNotifications(String userId) {
        return notificationRepository.findByUserIdAndReadFalseOrderByCreatedAtDesc(userId);
    }

    public long getUnreadCount(String userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    public Notification markAsRead(String notificationId) {
        return notificationRepository.findById(notificationId)
            .map(notification -> {
                notification.setRead(true);
                return notificationRepository.save(notification);
            })
            .orElse(null);
    }

    public void markAllAsRead(String userId) {
        List<Notification> unread = notificationRepository.findByUserIdAndReadFalseOrderByCreatedAtDesc(userId);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }
}
