package web.rtc.analytics.service;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import web.rtc.analytics.model.*;
import web.rtc.analytics.repository.*;
import java.time.*;
import java.util.*;

@Service
public class AnalyticsService {

    private final MeetingEventRepository eventRepository;
    private final DailyStatsRepository dailyStatsRepository;
    private final UserStatsRepository userStatsRepository;

    public AnalyticsService(MeetingEventRepository eventRepository,
                           DailyStatsRepository dailyStatsRepository,
                           UserStatsRepository userStatsRepository) {
        this.eventRepository = eventRepository;
        this.dailyStatsRepository = dailyStatsRepository;
        this.userStatsRepository = userStatsRepository;
    }

    public void trackEvent(MeetingEvent event) {
        eventRepository.save(event);
        updateUserStats(event);
    }

    private void updateUserStats(MeetingEvent event) {
        if (event.getUserId() == null) return;

        UserStats stats = userStatsRepository.findById(event.getUserId())
            .orElse(new UserStats(event.getUserId()));

        stats.setDisplayName(event.getUserName());
        stats.setLastActiveAt(Instant.now());

        switch (event.getEventType()) {
            case "room-created":
                stats.setTotalMeetingsHosted(stats.getTotalMeetingsHosted() + 1);
                break;
            case "user-joined":
                stats.setTotalMeetingsJoined(stats.getTotalMeetingsJoined() + 1);
                break;
        }

        userStatsRepository.save(stats);
    }

    public Map<String, Object> getDashboardStats() {
        LocalDate today = LocalDate.now();
        Instant startOfDay = today.atStartOfDay(ZoneId.systemDefault()).toInstant();
        Instant endOfDay = today.plusDays(1).atStartOfDay(ZoneId.systemDefault()).toInstant();

        long todayMeetings = eventRepository.countByEventTypeAndTimestampBetween("room-created", startOfDay, endOfDay);
        long todayParticipants = eventRepository.countByEventTypeAndTimestampBetween("user-joined", startOfDay, endOfDay);

        // Get last 7 days stats
        List<DailyStats> weekStats = dailyStatsRepository.findByDateBetweenOrderByDateDesc(
            today.minusDays(7), today);

        // Get top users
        List<UserStats> topUsers = userStatsRepository.findAllByOrderByTotalMeetingsJoinedDesc(PageRequest.of(0, 10));

        Map<String, Object> dashboard = new HashMap<>();
        dashboard.put("todayMeetings", todayMeetings);
        dashboard.put("todayParticipants", todayParticipants);
        dashboard.put("weeklyStats", weekStats);
        dashboard.put("topUsers", topUsers);
        dashboard.put("totalUsers", userStatsRepository.count());
        dashboard.put("totalMeetingsAllTime", eventRepository.countByEventTypeAndTimestampBetween(
            "room-created", Instant.EPOCH, Instant.now()));

        return dashboard;
    }

    public DailyStats getTodayStats() {
        LocalDate today = LocalDate.now();
        return dailyStatsRepository.findByDate(today).orElse(new DailyStats(today));
    }

    public List<DailyStats> getStatsRange(LocalDate start, LocalDate end) {
        return dailyStatsRepository.findByDateBetweenOrderByDateDesc(start, end);
    }

    public UserStats getUserStats(String userId) {
        return userStatsRepository.findById(userId).orElse(null);
    }

    public List<MeetingEvent> getRoomEvents(String roomId) {
        return eventRepository.findByRoomId(roomId);
    }

    // Called by scheduler to aggregate daily stats
    public void aggregateDailyStats(LocalDate date) {
        Instant startOfDay = date.atStartOfDay(ZoneId.systemDefault()).toInstant();
        Instant endOfDay = date.plusDays(1).atStartOfDay(ZoneId.systemDefault()).toInstant();

        DailyStats stats = dailyStatsRepository.findByDate(date).orElse(new DailyStats(date));

        stats.setTotalMeetings(eventRepository.countByEventTypeAndTimestampBetween("room-created", startOfDay, endOfDay));
        stats.setTotalParticipants(eventRepository.countByEventTypeAndTimestampBetween("user-joined", startOfDay, endOfDay));

        if (stats.getTotalMeetings() > 0) {
            stats.setAvgParticipantsPerMeeting((double) stats.getTotalParticipants() / stats.getTotalMeetings());
        }

        dailyStatsRepository.save(stats);
    }
}
