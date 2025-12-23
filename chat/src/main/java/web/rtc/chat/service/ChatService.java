package web.rtc.chat.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import web.rtc.chat.model.Message;
import web.rtc.chat.repository.MessageRepository;
import java.util.Map;

@Service
public class ChatService {
    
    private final MessageRepository messageRepository;

    public ChatService(MessageRepository messageRepository) {
        this.messageRepository = messageRepository;
    }

    public Page<Message> getMessages(String roomId, int page, int size) {
        return messageRepository.findByRoomIdOrderByCreatedAtDesc(roomId, PageRequest.of(page, size));
    }

    public Message saveMessage(String roomId, String senderId, String senderName, String content) {
        Message message = new Message(roomId, senderId, senderName, content);
        return messageRepository.save(message);
    }

    @KafkaListener(topics = "chat-messages", groupId = "chat-service")
    public void handleChatMessage(Map<String, Object> payload) {
        String roomId = (String) payload.get("roomId");
        String senderId = (String) payload.get("senderId");
        String senderName = (String) payload.get("senderName");
        String content = (String) payload.get("content");
        
        if (roomId != null && content != null) {
            saveMessage(roomId, senderId, senderName, content);
        }
    }
}
