package com.ketokki.stickermaker.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    private String projectName;

    private String characterName;

    private String targetPlatform;

    private String uploadType;

    private String status;

    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (this.status == null) {
            this.status = "CREATED";
        }

        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }
}