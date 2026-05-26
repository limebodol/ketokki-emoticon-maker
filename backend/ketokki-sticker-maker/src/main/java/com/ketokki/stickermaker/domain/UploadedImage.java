package com.ketokki.stickermaker.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
public class UploadedImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 어떤 프로젝트에 속한 이미지인지 저장
    private Long projectId;

    // 사용자가 올린 원래 파일명
    private String originalFileName;

    // 서버에 저장된 실제 파일 경로
    private String storedFilePath;

    // 이미지 가로 크기
    private Integer width;

    // 이미지 세로 크기
    private Integer height;

    // 파일 용량
    private Long fileSize;

    // 파일 형식: PNG, JPG 등
    private String format;

    // 몇 번째 이미지인지
    private Integer sortOrder;

    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}