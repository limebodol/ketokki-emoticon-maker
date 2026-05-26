package com.ketokki.stickermaker.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class OgqValidationResponse {

    private Long projectId;

    private String platformName;

    private boolean valid;

    private int totalScore;

    private int totalCount;

    private int successCount;

    private int failCount;

    private List<ValidationItem> items;
}