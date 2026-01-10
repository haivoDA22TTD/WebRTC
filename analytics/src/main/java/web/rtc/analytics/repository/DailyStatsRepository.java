package web.rtc.analytics.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import web.rtc.analytics.model.DailyStats;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface DailyStatsRepository extends MongoRepository<DailyStats, String> {
    Optional<DailyStats> findByDate(LocalDate date);
    List<DailyStats> findByDateBetweenOrderByDateDesc(LocalDate start, LocalDate end);
}
