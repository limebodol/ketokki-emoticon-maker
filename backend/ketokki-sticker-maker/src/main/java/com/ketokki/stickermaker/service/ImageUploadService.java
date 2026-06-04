package com.ketokki.stickermaker.service;

import com.ketokki.stickermaker.domain.UploadedImage;
import com.ketokki.stickermaker.repository.UploadedImageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.File;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ImageUploadService {

    private static final int MAX_FILE_COUNT = 40;
    private static final long MAX_FILE_SIZE = 1024 * 1024; // 1MB

    private final UploadedImageRepository uploadedImageRepository;

    @Value("${file.upload-dir}")
    private String uploadDir;

    public List<UploadedImage> uploadImages(Long projectId, MultipartFile[] files) {
        validateFiles(files);

        try {
            /*
             * 같은 프로젝트에 다시 업로드할 경우
             * 기존 업로드 DB 기록을 삭제합니다.
             */
            uploadedImageRepository.deleteByProjectId(projectId);

            File projectUploadDir = new File(uploadDir + "/" + projectId);

            if (!projectUploadDir.exists()) {
                boolean created = projectUploadDir.mkdirs();

                if (!created) {
                    throw new RuntimeException(
                            "업로드 폴더를 생성할 수 없습니다: " + projectUploadDir.getAbsolutePath()
                    );
                }
            }

            List<UploadedImage> savedImages = new ArrayList<>();

            for (int i = 0; i < files.length; i++) {
                MultipartFile file = files[i];

                validateSingleFile(file);

                BufferedImage image = ImageIO.read(file.getInputStream());

                if (image == null) {
                    throw new RuntimeException(
                            "이미지 파일을 읽을 수 없습니다. 파일명: " + file.getOriginalFilename()
                    );
                }

                String originalFileName = file.getOriginalFilename();
                String extension = getExtension(originalFileName);
                String storedFileName = UUID.randomUUID() + "." + extension;

                File savedFile = new File(projectUploadDir, storedFileName);

                file.transferTo(savedFile);

                UploadedImage uploadedImage = new UploadedImage();
                uploadedImage.setProjectId(projectId);
                uploadedImage.setOriginalFileName(originalFileName);
                uploadedImage.setStoredFilePath(savedFile.getAbsolutePath());
                uploadedImage.setWidth(image.getWidth());
                uploadedImage.setHeight(image.getHeight());
                uploadedImage.setFileSize(savedFile.length());
                uploadedImage.setFormat(extension.toUpperCase());
                uploadedImage.setSortOrder(i + 1);

                savedImages.add(uploadedImageRepository.save(uploadedImage));
            }

            return savedImages;

        } catch (Exception e) {
            throw new RuntimeException("이미지 업로드 실패: " + e.getMessage(), e);
        }
    }

    private void validateFiles(MultipartFile[] files) {
        if (files == null || files.length == 0) {
            throw new RuntimeException("업로드할 이미지 파일이 없습니다.");
        }

        if (files.length > MAX_FILE_COUNT) {
            throw new RuntimeException(
                    "1회 업로드는 최대 "
                            + MAX_FILE_COUNT
                            + "장까지만 가능합니다. 현재 선택한 파일 수: "
                            + files.length
                            + "장"
            );
        }
    }

    private void validateSingleFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("빈 파일은 업로드할 수 없습니다.");
        }

        String originalFileName = file.getOriginalFilename();

        if (originalFileName == null || originalFileName.trim().isEmpty()) {
            throw new RuntimeException("파일명이 없는 파일은 업로드할 수 없습니다.");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new RuntimeException(
                    "이미지 1장 최대 용량은 1MB입니다. 용량을 줄인 뒤 다시 업로드해주세요. 파일명: "
                            + originalFileName
            );
        }

        String extension = getExtension(originalFileName);

        if (!isAllowedExtension(extension)) {
            throw new RuntimeException(
                    "허용되지 않는 파일 형식입니다. 파일명: "
                            + originalFileName
                            + ", 허용 형식: PNG, JPG, JPEG"
            );
        }

        String contentType = file.getContentType();

        if (contentType == null || !isAllowedContentType(contentType)) {
            throw new RuntimeException(
                    "PNG 또는 JPG/JPEG 이미지 파일만 업로드할 수 있습니다. 파일명: "
                            + originalFileName
                            + ", 감지된 형식: "
                            + contentType
            );
        }
    }

    private String getExtension(String fileName) {
        int dotIndex = fileName.lastIndexOf(".");

        if (dotIndex == -1 || dotIndex == fileName.length() - 1) {
            throw new RuntimeException(
                    "확장자가 없는 파일은 업로드할 수 없습니다. 파일명: " + fileName
            );
        }

        return fileName.substring(dotIndex + 1).toLowerCase();
    }

    private boolean isAllowedExtension(String extension) {
        return "png".equalsIgnoreCase(extension)
                || "jpg".equalsIgnoreCase(extension)
                || "jpeg".equalsIgnoreCase(extension);
    }

    private boolean isAllowedContentType(String contentType) {
        return "image/png".equalsIgnoreCase(contentType)
                || "image/jpeg".equalsIgnoreCase(contentType)
                || "image/jpg".equalsIgnoreCase(contentType);
    }
}