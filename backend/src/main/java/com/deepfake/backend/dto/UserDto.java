package com.deepfake.backend.dto;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    private Long id;
    private String email;
    private String name;
    private String role;
    private String status;
    private LocalDateTime createdAt;
    
    // Optional password field (only used when receiving input for adding/editing users, not returned in response)
    private String password;
}
