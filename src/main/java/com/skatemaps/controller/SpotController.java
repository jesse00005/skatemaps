package com.skatemaps.controller;

import com.skatemaps.entity.Spot;
import com.skatemaps.entity.User;
import com.skatemaps.repository.SpotRepository;
import com.skatemaps.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/spots") // Base URL for all spot requests
public class SpotController {

    private final SpotRepository spotRepository;
    private final UserRepository userRepository;

    public SpotController(SpotRepository spotRepository, UserRepository userRepository) {
        this.spotRepository = spotRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<Spot> getAllSpots() {
        return spotRepository.findAll();
    }

    @PostMapping("/user/{userId}")
    public ResponseEntity<?> createSpot(@PathVariable Long userId, @RequestBody Spot spot) {

        // Find the user making the request
        Optional<User> optionalUser = userRepository.findById(userId);
        if (optionalUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found.");
        }

        // Attach the user to the spot
        User creator = optionalUser.get();
        spot.setCreatedBy(creator);

        // Save the spot to the database
        Spot savedSpot = spotRepository.save(spot);

        return ResponseEntity.status(HttpStatus.CREATED).body(savedSpot);
    }
}