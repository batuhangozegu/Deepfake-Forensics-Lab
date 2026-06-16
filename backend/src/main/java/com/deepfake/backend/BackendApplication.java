package com.deepfake.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import com.deepfake.backend.entity.User;
import com.deepfake.backend.repository.UserRepository;
import com.deepfake.backend.util.PasswordEncoder;

@SpringBootApplication
public class BackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
    }
    
    @Bean
    public CommandLineRunner seedUsers(UserRepository userRepository) {
        return args -> {
            if (userRepository.count() == 0) {
                // Seed admin user
                User admin = new User();
                admin.setEmail("admin@detector.io");
                admin.setName("System Admin");
                admin.setRole("admin");
                admin.setStatus("active");
                String adminSalt = PasswordEncoder.generateSalt();
                admin.setSalt(adminSalt);
                admin.setPassword(PasswordEncoder.hashPassword("admin123", adminSalt));
                userRepository.save(admin);
                
                // Seed standard user
                User user = new User();
                user.setEmail("user@detector.io");
                user.setName("Standard User");
                user.setRole("user");
                user.setStatus("active");
                String userSalt = PasswordEncoder.generateSalt();
                user.setSalt(userSalt);
                user.setPassword(PasswordEncoder.hashPassword("user123", userSalt));
                userRepository.save(user);
                
                System.out.println("Default users seeded successfully!");
            }
        };
    }
}