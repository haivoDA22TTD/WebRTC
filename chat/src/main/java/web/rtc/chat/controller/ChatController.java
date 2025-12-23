package web.rtc.chat.controller;

import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import web.rtc.chat.model.Message;
import web.rtc.chat.service.ChatService;
import java.util.Map;

@RestController
@RequestMapping("/chat")
public class ChatController {
    
    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @GetMapping("/{roomId}/messages")
    public ResponseEntity<Page<Message>> getMessages(
            @PathVariable String roomId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        return ResponseEntity.ok(chatService.getMessages(roomId, page, size));
    }

    @PostMapping("/{roomId}/messages")
    public ResponseEntity<Message> sendMessage(
            @PathVariable String roomId,
            @RequestBody Map<String, String> request,
            @RequestHeader("X-User-Id") String userId,
            @RequestHeader("X-Display-Name") String displayName) {
        String content = request.get("content");
        Message message = chatService.saveMessage(roomId, userId, displayName, content);
        return ResponseEntity.ok(message);
    }
}
