package web.rtc.auth.dto;

import web.rtc.auth.model.User;

public class UserDto {
    private String id;
    private String email;
    private String username;
    private String displayName;
    private String avatar;
    private String status;
    private String createdAt;

    public UserDto() {}

    public static UserDto fromUser(User user) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setUsername(user.getUsername());
        dto.setDisplayName(user.getDisplayName());
        dto.setAvatar(user.getAvatar());
        dto.setStatus(user.getStatus());
        dto.setCreatedAt(user.getCreatedAt().toString());
        return dto;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    
    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }
    
    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
