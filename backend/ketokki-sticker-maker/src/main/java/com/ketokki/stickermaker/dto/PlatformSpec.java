package com.ketokki.stickermaker.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class PlatformSpec {

    private String platformName;

    private int requiredStickerCount;

    private Integer minStickerCount;
    private Integer maxStickerCount;

    private int stickerWidth;
    private int stickerHeight;

    private int mainWidth;
    private int mainHeight;

    private int tabWidth;
    private int tabHeight;

    private long maxFileSizeBytes;

    private String outputFolderName;
    private String stickerFilePrefix;

    private boolean tabImageRequired;

    private String submissionType;
}