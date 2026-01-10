package web.rtc.analytics.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDate;

@Document(collection = "daily_stats")
public class DailyStats {
    @Id
    private String id;
    private LocalDate date;
    private long totalMeetings;
    private long totalParticipants;
    private long uniqueUsers;
    private long totalDurationMinutes;
    private double avgParticipantsPerMeeting;
    private double avgDurationMinutes;
    private long peakConcurrentMeetings;
    private String peakHour;

    public DailyStats() {}

    public DailyStats(LocalDate date) {
        this.date = date;
        this.id = date.toString();
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public long getTotalMeetings() { return totalMeetings; }
    public void setTotalMeetings(long totalMeetings) { this.totalMeetings = totalMeetings; }

    public long getTotalParticipants() { return totalParticipants; }
    public void setTotalParticipants(long totalParticipants) { this.totalParticipants = totalParticipants; }

    public long getUniqueUsers() { return uniqueUsers; }
    public void setUniqueUsers(long uniqueUsers) { this.uniqueUsers = uniqueUsers; }

    public long getTotalDurationMinutes() { return totalDurationMinutes; }
    public void setTotalDurationMinutes(long totalDurationMinutes) { this.totalDurationMinutes = totalDurationMinutes; }

    public double getAvgParticipantsPerMeeting() { return avgParticipantsPerMeeting; }
    public void setAvgParticipantsPerMeeting(double avg) { this.avgParticipantsPerMeeting = avg; }

    public double getAvgDurationMinutes() { return avgDurationMinutes; }
    public void setAvgDurationMinutes(double avgDurationMinutes) { this.avgDurationMinutes = avgDurationMinutes; }

    public long getPeakConcurrentMeetings() { return peakConcurrentMeetings; }
    public void setPeakConcurrentMeetings(long peak) { this.peakConcurrentMeetings = peak; }

    public String getPeakHour() { return peakHour; }
    public void setPeakHour(String peakHour) { this.peakHour = peakHour; }
}
