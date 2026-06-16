package com.deepfake.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;

import com.deepfake.backend.entity.User;
import com.deepfake.backend.repository.UserRepository;
import com.deepfake.backend.dto.UserDto;
import com.deepfake.backend.util.PasswordEncoder;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String password = payload.get("password");

        if (email == null || password == null) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "E-posta ve şifre zorunludur.");
            return ResponseEntity.badRequest().body(error);
        }

        Optional<User> userOpt = userRepository.findByEmail(email.trim());
        if (userOpt.isEmpty()) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Geçersiz e-posta veya şifre.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }

        User user = userOpt.get();
        if ("passive".equalsIgnoreCase(user.getStatus())) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Hesabınız pasif durumdadır. Lütfen yöneticinizle iletişime geçin.");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
        }

        boolean verified = PasswordEncoder.verifyPassword(password, user.getPassword(), user.getSalt());
        if (!verified) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Geçersiz e-posta veya şifre.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }

        UserDto userDto = new UserDto(
            user.getId(),
            user.getEmail(),
            user.getName(),
            user.getRole(),
            user.getStatus(),
            user.getCreatedAt(),
            null
        );

        return ResponseEntity.ok(userDto);
    }
}
