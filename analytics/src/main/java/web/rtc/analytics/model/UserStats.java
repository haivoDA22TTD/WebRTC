package web.rtc.analytics.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.Instant;

@Document(collection = "user_stats")
public class UserStats {
    @Id
    private String userId;
    private String displayName;
    private long totalMeetingsJoined;
    private long totalMeetingsHosted;
    private long totalMinutesInMeetings;
    private Instant lastActiveAt;
    private Instant firstSeenAt;

    public UserStats() {}

    public UserStats(String userId) {
        this.userId = userId;
        this.firstSeenAt = Instant.now();
        this.lastActiveAt = Instant.now();
    }

    // Getters and Setters
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }

    public long getTotalMeetingsJoined() { return totalMeetingsJoined; }
    public void setTotalMeetingsJoined(long total) { this.totalMeetingsJoined = total; }

    public long getTotalMeetingsHosted() { return totalMeetingsHosted; }
    public void setTotalMeetingsHosted(long total) { this.totalMeetingsHosted = total; }

    public long getTotalMinutesInMeetings() { return totalMinutesInMeetings; }
    public void setTotalMinutesInMeetings(long total) { this.totalMinutesInMeetings = total; }

    public Instant getLastActiveAt() { return lastActiveAt; }
    public void setLastActiveAt(Instant lastActiveAt) { this.lastActiveAt = lastActiveAt; }

    public Instant getFirstSeenAt() { return firstSeenAt; }
    public void setFirstSeenAt(Instant firstSeenAt) { this.firstSeenAt = firstSeenAt; }
}
