package com.ketokki.stickermaker.dto;

import com.ketokki.stickermaker.domain.Project;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class ProjectListResponse {

    private Long id;
    private Long userId;
    private String projectName;
    private String characterName;
    private String targetPlatform;
    private String uploadType;
    private String status;
    private LocalDateTime createdAt;

    public ProjectListResponse(Project project) {
        this.id = project.getId();
        this.userId = project.getUserId();
        this.projectName = project.getProjectName();
        this.characterName = project.getCharacterName();
        this.targetPlatform = project.getTargetPlatform();
        this.uploadType = project.getUploadType();
        this.status = project.getStatus();
        this.createdAt = project.getCreatedAt();
    }
}