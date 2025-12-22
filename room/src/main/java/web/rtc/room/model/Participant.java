package web.rtc.room.model;

import java.time.Instant;

public class Participant {
    private String userId;
    private String username;
    private String displayName;
    private String avatar;
    private boolean isHost;
    private boolean isMuted;
    private boolean isVideoOff;
    private boolean isScreenSharing;
    private Instant joinedAt = Instant.now();

    public Participant() {}

    public Participant(String userId, String username, String displayName, boolean isHost) {
        this.userId = userId;
        this.username = username;
        this.displayName = displayName;
        this.isHost = isHost;
    }

    // Getters and Setters
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    
    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }
    
    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }
    
    public boolean isHost() { return isHost; }
    public void setHost(boolean host) { isHost = host; }
    
    public boolean isMuted() { return isMuted; }
    public void setMuted(boolean muted) { isMuted = muted; }
    
    public boolean isVideoOff() { return isVideoOff; }
    public void setVideoOff(boolean videoOff) { isVideoOff = videoOff; }
    
    public boolean isScreenSharing() { return isScreenSharing; }
    public void setScreenSharing(boolean screenSharing) { isScreenSharing = screenSharing; }
    
    public Instant getJoinedAt() { return joinedAt; }
    public void setJoinedAt(Instant joinedAt) { this.joinedAt = joinedAt; }
}
