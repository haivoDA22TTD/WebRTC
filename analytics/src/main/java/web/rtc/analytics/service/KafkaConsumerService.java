package web.rtc.analytics.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import web.rtc.analytics.model.MeetingEvent;
import java.util.Map;

@Service
public class KafkaConsumerService {

    private final AnalyticsService analyticsService;
    private final ObjectMapper objectMapper;

    public KafkaConsumerService(AnalyticsService analyticsService, ObjectMapper objectMapper) {
        this.analyticsService = analyticsService;
        this.objectMapper = objectMapper;
    }

    @KafkaListener(topics = "room-events", groupId = "analytics-service")
    public void consumeRoomEvents(String message) {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> data = objectMapper.readValue(message, Map.class);
            
            MeetingEvent event = new MeetingEvent();
            event.setEventType((String) data.get("type"));
            event.setRoomId((String) data.get("roomId"));
            event.setRoomCode((String) data.get("roomCode"));
            event.setUserId((String) data.get("userId"));
            event.setUserName((String) data.get("userName"));
            
            // Store additional data as metadata
            event.setMetadata(data);
            
            analyticsService.trackEvent(event);
            
        } catch (Exception e) {
            System.err.println("Error processing room event: " + e.getMessage());
        }
    }

    @KafkaListener(topics = "user-events", groupId = "analytics-service")
    public void consumeUserEvents(String message) {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> data = objectMapper.readValue(message, Map.class);
            
            MeetingEvent event = new MeetingEvent();
            event.setEventType((String) data.get("type"));
            event.setUserId((String) data.get("userId"));
            event.setUserName((String) data.get("userName"));
            event.setMetadata(data);
            
            analyticsService.trackEvent(event);
            
        } catch (Exception e) {
            System.err.println("Error processing user event: " + e.getMessage());
        }
    }
}
