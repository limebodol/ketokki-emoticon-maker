package com.ketokki.stickermaker.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
public class UploadLimitService {

    private static final int MAX_UPLOAD_COUNT = 40;
    private static final long MAX_FILE_SIZE_BYTES = 1024 * 1024; // 1MB

    public void validateUploadFiles(List<MultipartFile> files) {
        if (files == null || files.isEmpty()) {
            throw new IllegalArgumentException("업로드할 이미지를 선택해주세요.");
        }

        if (files.size() > MAX_UPLOAD_COUNT) {
            throw new IllegalArgumentException(
                    "1회 업로드는 최대 " + MAX_UPLOAD_COUNT + "장까지만 가능합니다. 현재 선택한 파일 수: " + files.size() + "장"
            );
        }

        for (MultipartFile file : files) {
            validateSingleFile(file);
        }
    }

    private void validateSingleFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("비어 있는 파일은 업로드할 수 없습니다.");
        }

        String originalFileName = file.getOriginalFilename();

        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new IllegalArgumentException(
                    "이미지 1장 최대 용량은 1MB입니다. 용량을 줄인 뒤 다시 업로드해주세요. 파일명: "
                            + originalFileName
            );
        }

        String contentType = file.getContentType();

        if (!isAllowedImageType(contentType)) {
            throw new IllegalArgumentException(
                    "PNG 또는 JPG/JPEG 이미지 파일만 업로드할 수 있습니다. 파일명: "
                            + originalFileName
            );
        }
    }

    private boolean isAllowedImageType(String contentType) {
        return "image/png".equalsIgnoreCase(contentType)
                || "image/jpeg".equalsIgnoreCase(contentType)
                || "image/jpg".equalsIgnoreCase(contentType);
    }
}