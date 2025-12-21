package web.rtc.profile.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import web.rtc.profile.model.Profile;
import web.rtc.profile.service.ProfileService;
import java.util.Map;

@RestController
@RequestMapping("/profiles")
public class ProfileController {
    
    private final ProfileService profileService;

    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping("/{userId}")
    public ResponseEntity<Profile> getProfile(@PathVariable String userId) {
        return ResponseEntity.ok(profileService.getProfile(userId));
    }

    @PutMapping("/me")
    public ResponseEntity<Profile> updateProfile(
            @RequestBody Map<String, String> request,
            @RequestHeader("X-User-Id") String userId) {
        Profile profile = profileService.updateProfile(
            userId,
            request.get("displayName"),
            request.get("avatar"),
            request.get("bio")
        );
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/me/status")
    public ResponseEntity<Profile> updateStatus(
            @RequestBody Map<String, String> request,
            @RequestHeader("X-User-Id") String userId) {
        Profile profile = profileService.updateStatus(userId, request.get("status"));
        return ResponseEntity.ok(profile);
    }
}
