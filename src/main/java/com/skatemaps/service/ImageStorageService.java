package com.skatemaps.service;

import com.skatemaps.entity.Spot;
import com.skatemaps.entity.SpotImage;
import com.skatemaps.repository.SpotImageRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class ImageStorageService {

    private final String UPLOAD_DIRECTORY = "uploads/spot-images/";

    private final SpotImageRepository spotImageRepository;

    public ImageStorageService(SpotImageRepository spotImageRepository) {
        this.spotImageRepository = spotImageRepository;
    }

    private String saveFileToDisk(MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Cannot upload an empty file.");
        }

        Path uploadPath = Paths.get(UPLOAD_DIRECTORY);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String uniqueFilename = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        Path destinationPath = uploadPath.resolve(uniqueFilename);
        Files.copy(file.getInputStream(), destinationPath, StandardCopyOption.REPLACE_EXISTING);

        return UPLOAD_DIRECTORY + uniqueFilename;
    }

    public SpotImage uploadAndSaveImage(MultipartFile file, Spot spot) throws IOException {

        String filePath = saveFileToDisk(file);

        SpotImage newImage = new SpotImage();
        newImage.setFilePath(filePath);
        newImage.setSpot(spot);

        return spotImageRepository.save(newImage);
    }
}