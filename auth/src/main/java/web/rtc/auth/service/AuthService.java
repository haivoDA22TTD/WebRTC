package web.rtc.auth.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import web.rtc.auth.dto.*;
import web.rtc.auth.model.User;
import web.rtc.auth.repository.UserRepository;
import web.rtc.auth.security.JwtUtil;

@Service
public class AuthService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }

        User user = new User(
            request.getEmail(),
            request.getUsername(),
            passwordEncoder.encode(request.getPassword()),
            request.getDisplayName()
        );
        user = userRepository.save(user);

        String token = jwtUtil.generateToken(user.getId(), user.getEmail());
        return new AuthResponse(UserDto.fromUser(user), token);
    }

    public AuthResponse login(AuthRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        user.setStatus("online");
        userRepository.save(user);

        String token = jwtUtil.generateToken(user.getId(), user.getEmail());
        return new AuthResponse(UserDto.fromUser(user), token);
    }

    public UserDto getCurrentUser(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return UserDto.fromUser(user);
    }

    public void logout(String userId) {
        userRepository.findById(userId).ifPresent(user -> {
            user.setStatus("offline");
            userRepository.save(user);
        });
    }
}
