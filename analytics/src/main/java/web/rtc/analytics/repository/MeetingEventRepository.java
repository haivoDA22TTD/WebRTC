package web.rtc.analytics.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Aggregation;
import web.rtc.analytics.model.MeetingEvent;
import java.time.Instant;
import java.util.List;

public interface MeetingEventRepository extends MongoRepository<MeetingEvent, String> {
    List<MeetingEvent> findByRoomId(String roomId);
    List<MeetingEvent> findByUserId(String userId);
    List<MeetingEvent> findByEventType(String eventType);
    List<MeetingEvent> findByTimestampBetween(Instant start, Instant end);
    long countByEventTypeAndTimestampBetween(String eventType, Instant start, Instant end);
}
