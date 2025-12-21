package web.rtc.auth.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import web.rtc.auth.model.User;
import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);
    Optional<User> findByUsername(String username);
    boolean existsByEmail(String email);
    boolean existsByUsername(String username);
}
