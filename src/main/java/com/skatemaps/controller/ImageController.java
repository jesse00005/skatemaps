package com.skatemaps.controller;

import com.skatemaps.entity.Spot;
import com.skatemaps.entity.SpotImage;
import com.skatemaps.repository.SpotRepository;
import com.skatemaps.service.ImageStorageService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Optional;

@RestController // Tells Spring this class handles web requests and returns JSON
@RequestMapping("/api/images")
public class ImageController {

    private final ImageStorageService imageStorageService;
    private final SpotRepository spotRepository;

    public ImageController(ImageStorageService imageStorageService, SpotRepository spotRepository) {
        this.imageStorageService = imageStorageService;
        this.spotRepository = spotRepository;
    }

    @PostMapping("/upload/{spotId}")
    public ResponseEntity<?> uploadSpotImage(@RequestParam("file") MultipartFile file, @PathVariable Long spotId) {
        try {
            Optional<Spot> optionalSpot = spotRepository.findById(spotId);
            if (optionalSpot.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Skate spot not found.");
            }

            Spot spot = optionalSpot.get();

            SpotImage savedImage = imageStorageService.uploadAndSaveImage(file, spot);

            return ResponseEntity.ok("Image uploaded successfully! Database ID: " + savedImage.getId());

        } catch (Exception e) {

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Could not upload the image: " + e.getMessage());
        }
    }
}