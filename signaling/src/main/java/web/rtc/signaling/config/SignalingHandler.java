package web.rtc.signaling.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import web.rtc.signaling.service.SignalingService;
import java.util.Map;

@Component
public class SignalingHandler extends TextWebSocketHandler {
    
    private final SignalingService signalingService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public SignalingHandler(SignalingService signalingService) {
        this.signalingService = signalingService;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        signalingService.addSession(session);
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        Map<String, Object> payload = objectMapper.readValue(message.getPayload(), Map.class);
        String type = (String) payload.get("type");

        switch (type) {
            case "join" -> signalingService.handleJoin(session, payload);
            case "leave" -> signalingService.handleLeave(session, payload);
            case "offer" -> signalingService.handleOffer(session, payload);
            case "answer" -> signalingService.handleAnswer(session, payload);
            case "ice-candidate" -> signalingService.handleIceCandidate(session, payload);
            case "chat" -> signalingService.handleChat(session, payload);
            case "mute-toggle" -> signalingService.handleMediaStateChange(session, payload, "audio");
            case "video-toggle" -> signalingService.handleMediaStateChange(session, payload, "video");
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        signalingService.removeSession(session);
    }
}
