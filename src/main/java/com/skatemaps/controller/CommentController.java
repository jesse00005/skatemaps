package com.skatemaps.controller;

import com.skatemaps.entity.Comment;
import com.skatemaps.entity.Spot;
import com.skatemaps.entity.User;
import com.skatemaps.repository.CommentRepository;
import com.skatemaps.repository.SpotRepository;
import com.skatemaps.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/comments")
public class CommentController {

    private final CommentRepository commentRepository;
    private final SpotRepository spotRepository;
    private final UserRepository userRepository;

    // Constructor Injection
    public CommentController(CommentRepository commentRepository, SpotRepository spotRepository, UserRepository userRepository) {
        this.commentRepository = commentRepository;
        this.spotRepository = spotRepository;
        this.userRepository = userRepository;
    }

    @PostMapping("/spot/{spotId}/user/{userId}")
    public ResponseEntity<?> addComment(@PathVariable Long spotId, @PathVariable Long userId, @RequestBody Comment comment) {

        Optional<Spot> optionalSpot = spotRepository.findById(spotId);
        Optional<User> optionalUser = userRepository.findById(userId);

        if (optionalSpot.isEmpty() || optionalUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Error: Spot or User not found.");
        }

        comment.setSpot(optionalSpot.get());
        comment.setAuthor(optionalUser.get());

        Comment savedComment = commentRepository.save(comment);

        return ResponseEntity.status(HttpStatus.CREATED).body(savedComment);
    }

    @GetMapping("/spot/{spotId}")
    public ResponseEntity<List<Comment>> getCommentsForSpot(@PathVariable Long spotId) {
        List<Comment> comments = commentRepository.findBySpotId(spotId);
        return ResponseEntity.ok(comments);
    }
}