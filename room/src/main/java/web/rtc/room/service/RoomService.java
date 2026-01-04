package web.rtc.room.service;

import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Service;
import web.rtc.room.model.*;
import web.rtc.room.repository.RoomRepository;
import java.util.Map;
import java.util.UUID;

@Service
public class RoomService {
    
    private final RoomRepository roomRepository;
    @Nullable
    private final KafkaTemplate<String, Object> kafkaTemplate;

    public RoomService(RoomRepository roomRepository, @Nullable KafkaTemplate<String, Object> kafkaTemplate) {
        this.roomRepository = roomRepository;
        this.kafkaTemplate = kafkaTemplate;
    }

    private void sendEvent(String topic, Map<String, Object> event) {
        if (kafkaTemplate != null) {
            kafkaTemplate.send(topic, event);
        }
    }

    public Room createRoom(String name, String hostId, String hostUsername, String hostDisplayName) {
        String code = generateRoomCode();
        Room room = new Room(name, code, hostId);
        
        Participant host = new Participant(hostId, hostUsername, hostDisplayName, true);
        room.getParticipants().add(host);
        
        room = roomRepository.save(room);
        
        // Send notification event
        sendEvent("room-events", Map.of(
            "type", "room-created",
            "roomId", room.getId(),
            "roomCode", code,
            "roomName", name,
            "hostId", hostId,
            "hostName", hostDisplayName
        ));
        
        return room;
    }

    public Room joinRoom(String code, String userId, String username, String displayName) {
        Room room = roomRepository.findByCodeAndIsActiveTrue(code)
                .orElseThrow(() -> new RuntimeException("Room not found or inactive"));

        if (room.getParticipants().size() >= room.getSettings().getMaxParticipants()) {
            throw new RuntimeException("Room is full");
        }

        boolean alreadyJoined = room.getParticipants().stream()
                .anyMatch(p -> p.getUserId().equals(userId));
        
        if (!alreadyJoined) {
            Participant participant = new Participant(userId, username, displayName, false);
            if (room.getSettings().isMuteOnJoin()) {
                participant.setMuted(true);
            }
            room.getParticipants().add(participant);
            room = roomRepository.save(room);
            
            // Send notification to host
            sendEvent("room-events", Map.of(
                "type", "user-joined",
                "roomId", room.getId(),
                "roomCode", code,
                "hostId", room.getHostId(),
                "userId", userId,
                "userName", displayName
            ));
        }
        
        return room;
    }

    public void leaveRoom(String roomId, String userId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Room not found"));

        // Get user display name before removing
        String userName = room.getParticipants().stream()
                .filter(p -> p.getUserId().equals(userId))
                .findFirst()
                .map(Participant::getDisplayName)
                .orElse("Unknown");

        room.getParticipants().removeIf(p -> p.getUserId().equals(userId));
        
        String hostId = room.getHostId();
        
        if (room.getParticipants().isEmpty()) {
            room.setActive(false);
        } else if (room.getHostId().equals(userId)) {
            // Transfer host to first participant
            Participant newHost = room.getParticipants().get(0);
            newHost.setHost(true);
            room.setHostId(newHost.getUserId());
            hostId = newHost.getUserId();
        }
        
        roomRepository.save(room);
        
        // Send notification to host
        if (!room.getParticipants().isEmpty()) {
            sendEvent("room-events", Map.of(
                "type", "user-left",
                "roomId", roomId,
                "hostId", hostId,
                "userId", userId,
                "userName", userName
            ));
        }
    }

    public Room getRoom(String roomId) {
        return roomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Room not found"));
    }

    public void inviteToRoom(String roomId, String inviteeEmail, String inviteeId, String frontendUrl) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Room not found"));

        // Get host info
        Participant host = room.getParticipants().stream()
                .filter(Participant::isHost)
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Host not found"));

        String roomLink = frontendUrl + "/join/" + room.getCode();

        // Send meeting invite event
        sendEvent("room-events", Map.of(
            "type", "meeting-invite",
            "roomId", roomId,
            "roomCode", room.getCode(),
            "roomName", room.getName(),
            "roomLink", roomLink,
            "hostId", room.getHostId(),
            "hostName", host.getDisplayName(),
            "inviteeId", inviteeId != null ? inviteeId : "",
            "inviteeEmail", inviteeEmail
        ));
    }

    private String generateRoomCode() {
        return UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}
