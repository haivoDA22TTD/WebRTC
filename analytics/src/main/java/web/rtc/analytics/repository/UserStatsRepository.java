package web.rtc.analytics.repository;

import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import web.rtc.analytics.model.UserStats;
import java.util.List;

public interface UserStatsRepository extends MongoRepository<UserStats, String> {
    List<UserStats> findAllByOrderByTotalMeetingsJoinedDesc(Pageable pageable);
    List<UserStats> findAllByOrderByLastActiveAtDesc(Pageable pageable);
}
