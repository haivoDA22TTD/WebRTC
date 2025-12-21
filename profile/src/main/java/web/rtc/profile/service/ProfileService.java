package web.rtc.profile.service;

import org.springframework.stereotype.Service;
import web.rtc.profile.model.Profile;
import web.rtc.profile.repository.ProfileRepository;
import java.time.Instant;

@Service
public class ProfileService {
    
    private final ProfileRepository profileRepository;

    public ProfileService(ProfileRepository profileRepository) {
        this.profileRepository = profileRepository;
    }

    public Profile getProfile(String userId) {
        return profileRepository.findById(userId)
                .orElseGet(() -> {
                    Profile profile = new Profile(userId, "User");
                    return profileRepository.save(profile);
                });
    }

    public Profile updateProfile(String userId, String displayName, String avatar, String bio) {
        Profile profile = getProfile(userId);
        
        if (displayName != null) profile.setDisplayName(displayName);
        if (avatar != null) profile.setAvatar(avatar);
        if (bio != null) profile.setBio(bio);
        profile.setUpdatedAt(Instant.now());
        
        return profileRepository.save(profile);
    }

    public Profile updateStatus(String userId, String status) {
        Profile profile = getProfile(userId);
        profile.setStatus(status);
        profile.setLastSeen(Instant.now());
        profile.setUpdatedAt(Instant.now());
        return profileRepository.save(profile);
    }
}
