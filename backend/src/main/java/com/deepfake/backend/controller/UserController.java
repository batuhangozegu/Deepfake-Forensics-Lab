package com.deepfake.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.HashMap;
import java.util.Map;

import com.deepfake.backend.entity.User;
import com.deepfake.backend.repository.UserRepository;
import com.deepfake.backend.dto.UserDto;
import com.deepfake.backend.util.PasswordEncoder;

@RestController
@RequestMapping("/api/users")
@CrossOrigin
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
            .map(user -> new UserDto(
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getRole(),
                user.getStatus(),
                user.getCreatedAt(),
                null
            ))
            .collect(Collectors.toList());
    }

    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody UserDto userDto) {
        if (userRepository.existsByEmail(userDto.getEmail())) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "E-posta adresi zaten kullanımda.");
            return ResponseEntity.badRequest().body(error);
        }

        if (userDto.getPassword() == null || userDto.getPassword().trim().length() < 6) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Şifre en az 6 karakter olmalıdır.");
            return ResponseEntity.badRequest().body(error);
        }

        User user = new User();
        user.setEmail(userDto.getEmail().trim());
        user.setName(userDto.getName().trim());
        user.setRole(userDto.getRole() != null ? userDto.getRole() : "user");
        user.setStatus(userDto.getStatus() != null ? userDto.getStatus() : "active");

        String salt = PasswordEncoder.generateSalt();
        user.setSalt(salt);
        user.setPassword(PasswordEncoder.hashPassword(userDto.getPassword(), salt));

        User savedUser = userRepository.save(user);

        return ResponseEntity.status(HttpStatus.CREATED).body(new UserDto(
            savedUser.getId(),
            savedUser.getEmail(),
            savedUser.getName(),
            savedUser.getRole(),
            savedUser.getStatus(),
            savedUser.getCreatedAt(),
            null
        ));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody UserDto userDto) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User user = userOpt.get();

        // Check unique email if changed
        if (!user.getEmail().equalsIgnoreCase(userDto.getEmail()) && userRepository.existsByEmail(userDto.getEmail())) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "E-posta adresi zaten kullanımda.");
            return ResponseEntity.badRequest().body(error);
        }

        user.setEmail(userDto.getEmail().trim());
        user.setName(userDto.getName().trim());
        user.setRole(userDto.getRole());
        user.setStatus(userDto.getStatus());

        // Update password if a new one is provided
        if (userDto.getPassword() != null && !userDto.getPassword().trim().isEmpty()) {
            if (userDto.getPassword().trim().length() < 6) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Şifre en az 6 karakter olmalıdır.");
                return ResponseEntity.badRequest().body(error);
            }
            String salt = PasswordEncoder.generateSalt();
            user.setSalt(salt);
            user.setPassword(PasswordEncoder.hashPassword(userDto.getPassword(), salt));
        }

        User savedUser = userRepository.save(user);

        return ResponseEntity.ok(new UserDto(
            savedUser.getId(),
            savedUser.getEmail(),
            savedUser.getName(),
            savedUser.getRole(),
            savedUser.getStatus(),
            savedUser.getCreatedAt(),
            null
        ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        if (!userRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        userRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
