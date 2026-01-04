package web.rtc.room.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import web.rtc.room.model.Room;
import web.rtc.room.service.RoomService;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@RestController
@RequestMapping("/rooms")
public class RoomController {
    
    private final RoomService roomService;

    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }
    
    private String decode(String value) {
        if (value == null) return null;
        try {
            return URLDecoder.decode(value, StandardCharsets.UTF_8);
        } catch (Exception e) {
            return value;
        }
    }

    @PostMapping
    public ResponseEntity<Room> createRoom(
            @RequestBody Map<String, String> request,
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "X-Username", required = false) String username,
            @RequestHeader(value = "X-Display-Name", required = false) String displayName) {
        String name = request.getOrDefault("name", "My Meeting");
        String finalUserId = userId != null ? userId : "anonymous-" + System.currentTimeMillis();
        String finalUsername = decode(username) != null ? decode(username) : "user";
        String finalDisplayName = decode(displayName) != null ? decode(displayName) : "User";
        
        Room room = roomService.createRoom(name, finalUserId, finalUsername, finalDisplayName);
        return ResponseEntity.ok(room);
    }

    @PostMapping("/join/{code}")
    public ResponseEntity<Room> joinRoom(
            @PathVariable String code,
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "X-Username", required = false) String username,
            @RequestHeader(value = "X-Display-Name", required = false) String displayName) {
        String finalUserId = userId != null ? userId : "anonymous-" + System.currentTimeMillis();
        String finalUsername = decode(username) != null ? decode(username) : "user";
        String finalDisplayName = decode(displayName) != null ? decode(displayName) : "User";
        
        Room room = roomService.joinRoom(code, finalUserId, finalUsername, finalDisplayName);
        return ResponseEntity.ok(room);
    }

    @PostMapping("/{roomId}/leave")
    public ResponseEntity<Void> leaveRoom(
            @PathVariable String roomId,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        if (userId != null) {
            roomService.leaveRoom(roomId, userId);
        }
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{roomId}")
    public ResponseEntity<Room> getRoom(@PathVariable String roomId) {
        return ResponseEntity.ok(roomService.getRoom(roomId));
    }

    @GetMapping("/{roomId}/participants")
    public ResponseEntity<?> getParticipants(@PathVariable String roomId) {
        Room room = roomService.getRoom(roomId);
        return ResponseEntity.ok(room.getParticipants());
    }

    @PostMapping("/{roomId}/invite")
    public ResponseEntity<?> inviteToRoom(
            @PathVariable String roomId,
            @RequestBody Map<String, String> request) {
        String email = request.get("email");
        String inviteeId = request.get("inviteeId");
        String frontendUrl = request.getOrDefault("frontendUrl", "http://localhost:5173");
        
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
        }
        
        roomService.inviteToRoom(roomId, email, inviteeId, frontendUrl);
        return ResponseEntity.ok(Map.of("message", "Invitation sent successfully"));
    }
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleException(Exception e) {
        return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
    }
}
