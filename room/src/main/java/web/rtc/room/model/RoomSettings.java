package web.rtc.room.model;

public class RoomSettings {
    private int maxParticipants = 100;
    private boolean allowChat = true;
    private boolean allowScreenShare = true;
    private boolean muteOnJoin = false;
    private boolean requireApproval = false;

    public RoomSettings() {}

    // Getters and Setters
    public int getMaxParticipants() { return maxParticipants; }
    public void setMaxParticipants(int maxParticipants) { this.maxParticipants = maxParticipants; }
    
    public boolean isAllowChat() { return allowChat; }
    public void setAllowChat(boolean allowChat) { this.allowChat = allowChat; }
    
    public boolean isAllowScreenShare() { return allowScreenShare; }
    public void setAllowScreenShare(boolean allowScreenShare) { this.allowScreenShare = allowScreenShare; }
    
    public boolean isMuteOnJoin() { return muteOnJoin; }
    public void setMuteOnJoin(boolean muteOnJoin) { this.muteOnJoin = muteOnJoin; }
    
    public boolean isRequireApproval() { return requireApproval; }
    public void setRequireApproval(boolean requireApproval) { this.requireApproval = requireApproval; }
}
