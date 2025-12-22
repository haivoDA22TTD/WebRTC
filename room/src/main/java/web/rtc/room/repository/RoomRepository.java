package web.rtc.room.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import web.rtc.room.model.Room;
import java.util.Optional;

public interface RoomRepository extends MongoRepository<Room, String> {
    Optional<Room> findByCode(String code);
    Optional<Room> findByCodeAndIsActiveTrue(String code);
}
