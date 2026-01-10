package web.rtc.analytics.scheduler;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import web.rtc.analytics.service.AnalyticsService;
import java.time.LocalDate;

@Component
public class StatsAggregator {

    private final AnalyticsService analyticsService;

    public StatsAggregator(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    // Run every hour to aggregate stats
    @Scheduled(cron = "0 0 * * * *")
    public void aggregateHourlyStats() {
        analyticsService.aggregateDailyStats(LocalDate.now());
    }

    // Run at midnight to finalize previous day stats
    @Scheduled(cron = "0 5 0 * * *")
    public void aggregatePreviousDayStats() {
        analyticsService.aggregateDailyStats(LocalDate.now().minusDays(1));
    }
}
