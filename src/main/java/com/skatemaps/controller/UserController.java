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
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    public UserController(UserRepository userRepository, org.springframework.security.crypto.password.PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User loginAttempt) {

        User existingUser = userRepository.findByUsername(loginAttempt.getUsername());


        if (existingUser != null && passwordEncoder.matches(loginAttempt.getPasswordHash(), existingUser.getPasswordHash())) {
            return ResponseEntity.ok(existingUser);
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid username or password.");
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User newUser) {

        if (userRepository.findByUsername(newUser.getUsername()) != null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Username is already taken.");
        }

        newUser.setRole(User.Role.USER);

        newUser.setEmail(newUser.getUsername() + "@skatemaps.local");


        try {

            String plainPassword = newUser.getPasswordHash();
            newUser.setPasswordHash(passwordEncoder.encode(plainPassword));

            User savedUser = userRepository.save(newUser);
            return ResponseEntity.ok(savedUser);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Database error: " + e.getMessage());
        }
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @PutMapping("/{userId}/promote")
    public ResponseEntity<?> promoteUser(@PathVariable Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user != null) {
            user.setRole(User.Role.MODERATOR);
            return ResponseEntity.ok(userRepository.save(user));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found.");
    }
}