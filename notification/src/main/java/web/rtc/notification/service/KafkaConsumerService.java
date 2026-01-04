package web.rtc.notification.service;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import web.rtc.notification.dto.NotificationEvent;
import java.util.Map;

@Service
public class KafkaConsumerService {

    private final NotificationService notificationService;
    private final EmailService emailService;

    public KafkaConsumerService(NotificationService notificationService, EmailService emailService) {
        this.notificationService = notificationService;
        this.emailService = emailService;
    }

    @KafkaListener(topics = "room-events", groupId = "notification-service")
    public void handleRoomEvents(Map<String, Object> event) {
        String eventType = (String) event.get("type");

        switch (eventType) {
            case "room-created" -> handleRoomCreated(event);
            case "user-joined" -> handleUserJoined(event);
            case "user-left" -> handleUserLeft(event);
            case "meeting-invite" -> handleMeetingInvite(event);
        }
    }

    @KafkaListener(topics = "user-events", groupId = "notification-service")
    public void handleUserEvents(Map<String, Object> event) {
        String eventType = (String) event.get("type");

        switch (eventType) {
            case "user-registered" -> handleUserRegistered(event);
            case "password-reset" -> handlePasswordReset(event);
        }
    }

    private void handleRoomCreated(Map<String, Object> event) {
        NotificationEvent notification = new NotificationEvent();
        notification.setType("room-created");
        notification.setUserId((String) event.get("hostId"));
        notification.setTitle("Phòng họp đã được tạo");
        notification.setMessage("Mã phòng: " + event.get("roomCode"));
        notification.setData(event);
        notification.setSendPush(true);

        notificationService.createNotification(notification);
    }

    private void handleUserJoined(Map<String, Object> event) {
        String hostId = (String) event.get("hostId");
        String userName = (String) event.get("userName");

        NotificationEvent notification = new NotificationEvent();
        notification.setType("user-joined");
        notification.setUserId(hostId);
        notification.setTitle("Người dùng mới tham gia");
        notification.setMessage(userName + " đã tham gia phòng họp");
        notification.setData(event);
        notification.setSendPush(true);

        notificationService.createNotification(notification);
    }

    private void handleUserLeft(Map<String, Object> event) {
        String hostId = (String) event.get("hostId");
        String userName = (String) event.get("userName");

        NotificationEvent notification = new NotificationEvent();
        notification.setType("user-left");
        notification.setUserId(hostId);
        notification.setTitle("Người dùng đã rời phòng");
        notification.setMessage(userName + " đã rời khỏi phòng họp");
        notification.setData(event);
        notification.setSendPush(true);

        notificationService.createNotification(notification);
    }

    private void handleMeetingInvite(Map<String, Object> event) {
        String inviteeId = (String) event.get("inviteeId");
        String inviteeEmail = (String) event.get("inviteeEmail");
        String hostName = (String) event.get("hostName");
        String roomCode = (String) event.get("roomCode");
        String roomLink = (String) event.get("roomLink");

        // Push notification
        NotificationEvent notification = new NotificationEvent();
        notification.setType("meeting-invite");
        notification.setUserId(inviteeId);
        notification.setTitle("Lời mời tham gia cuộc họp");
        notification.setMessage(hostName + " đã mời bạn tham gia cuộc họp");
        notification.setData(event);
        notification.setSendPush(true);

        notificationService.createNotification(notification);

        // Email notification
        if (inviteeEmail != null) {
            emailService.sendMeetingInvite(inviteeEmail, hostName, roomCode, roomLink);
        }
    }

    private void handleUserRegistered(Map<String, Object> event) {
        String userId = (String) event.get("userId");
        String email = (String) event.get("email");

        NotificationEvent notification = new NotificationEvent();
        notification.setType("welcome");
        notification.setUserId(userId);
        notification.setTitle("Chào mừng bạn đến với WebRTC Meeting!");
        notification.setMessage("Tài khoản của bạn đã được tạo thành công.");
        notification.setSendPush(true);

        notificationService.createNotification(notification);
    }

    private void handlePasswordReset(Map<String, Object> event) {
        // Handle password reset notification
    }
}
