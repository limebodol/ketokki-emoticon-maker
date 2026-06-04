package com.ketokki.stickermaker.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProjectCreateRequest {

    private Long userId;

    private String projectName;

    private String characterName;

    private String targetPlatform;

    private String uploadType;
}