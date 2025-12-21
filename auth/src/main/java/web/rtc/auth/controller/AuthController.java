package web.rtc.auth.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import web.rtc.auth.dto.*;
import web.rtc.auth.service.AuthService;

@RestController
@RequestMapping("/auth")
public class AuthController {
    
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/me")
    public ResponseEntity<UserDto> getCurrentUser(@RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(authService.getCurrentUser(userId));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestHeader("X-User-Id") String userId) {
        authService.logout(userId);
        return ResponseEntity.ok().build();
    }
}
