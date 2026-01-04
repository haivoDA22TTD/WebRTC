package web.rtc.notification.dto;

import java.util.Map;

public class NotificationEvent {
    private String type;
    private String userId;
    private String title;
    private String message;
    private Map<String, Object> data;
    private boolean sendEmail;
    private boolean sendPush;

    public NotificationEvent() {}

    // Getters and Setters
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public Map<String, Object> getData() { return data; }
    public void setData(Map<String, Object> data) { this.data = data; }

    public boolean isSendEmail() { return sendEmail; }
    public void setSendEmail(boolean sendEmail) { this.sendEmail = sendEmail; }

    public boolean isSendPush() { return sendPush; }
    public void setSendPush(boolean sendPush) { this.sendPush = sendPush; }
}
