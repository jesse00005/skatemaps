package com.skatemaps.controller;

import com.skatemaps.entity.User;
import com.skatemaps.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User loginAttempt) {

        User existingUser = userRepository.findByUsername(loginAttempt.getUsername());

        if (existingUser != null && existingUser.getPasswordHash().equals(loginAttempt.getPasswordHash())) {
            return ResponseEntity.ok(existingUser);
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid username or password.");
    }
}