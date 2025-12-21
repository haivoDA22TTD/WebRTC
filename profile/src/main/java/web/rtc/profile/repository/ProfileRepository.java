package web.rtc.profile.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import web.rtc.profile.model.Profile;

public interface ProfileRepository extends MongoRepository<Profile, String> {
}
