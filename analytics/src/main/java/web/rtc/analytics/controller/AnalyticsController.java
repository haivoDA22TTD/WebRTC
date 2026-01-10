package web.rtc.analytics.controller;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import web.rtc.analytics.model.*;
import web.rtc.analytics.service.AnalyticsService;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "*")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard() {
        return ResponseEntity.ok(analyticsService.getDashboardStats());
    }

    @GetMapping("/today")
    public ResponseEntity<DailyStats> getTodayStats() {
        return ResponseEntity.ok(analyticsService.getTodayStats());
    }

    @GetMapping("/range")
    public ResponseEntity<List<DailyStats>> getStatsRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        return ResponseEntity.ok(analyticsService.getStatsRange(start, end));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<UserStats> getUserStats(@PathVariable String userId) {
        UserStats stats = analyticsService.getUserStats(userId);
        if (stats == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/room/{roomId}/events")
    public ResponseEntity<List<MeetingEvent>> getRoomEvents(@PathVariable String roomId) {
        return ResponseEntity.ok(analyticsService.getRoomEvents(roomId));
    }

    // Manual event tracking endpoint (for testing)
    @PostMapping("/track")
    public ResponseEntity<Void> trackEvent(@RequestBody MeetingEvent event) {
        analyticsService.trackEvent(event);
        return ResponseEntity.ok().build();
    }
}
