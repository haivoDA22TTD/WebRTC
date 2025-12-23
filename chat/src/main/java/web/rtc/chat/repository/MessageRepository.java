package web.rtc.chat.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import web.rtc.chat.model.Message;

public interface MessageRepository extends MongoRepository<Message, String> {
    Page<Message> findByRoomIdOrderByCreatedAtDesc(String roomId, Pageable pageable);
}
