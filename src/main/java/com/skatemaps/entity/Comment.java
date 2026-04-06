package com.skatemaps.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "comments")
@Getter
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "comment_id")
    private Long id;

    @Setter
    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    // Foreign Key to the User
    @Setter
    @ManyToOne
    @JoinColumn(name = "user_id")
    @JsonIgnoreProperties({"comments", "passwordHash", "email"})
    private User author;

    // Foreign Key to the Skate Spot
    @Setter
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "spot_id", nullable = false)
    @JsonIgnore
    private Spot spot;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}