package com.ketokki.stickermaker.service;

import com.ketokki.stickermaker.domain.ConvertedImage;
import com.ketokki.stickermaker.domain.UploadedImage;
import com.ketokki.stickermaker.repository.ConvertedImageRepository;
import com.ketokki.stickermaker.repository.UploadedImageRepository;
import com.ketokki.stickermaker.util.ImageResizeUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.File;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OgqConvertService {

    private final UploadedImageRepository uploadedImageRepository;
    private final ConvertedImageRepository convertedImageRepository;

    @Value("${file.converted-dir}")
    private String convertedDir;

    @Transactional
    public List<ConvertedImage> convertToOgq(Long projectId) {
        List<UploadedImage> uploadedImages =
                uploadedImageRepository.findByProjectIdOrderBySortOrderAsc(projectId);

        if (uploadedImages.isEmpty()) {
            throw new RuntimeException("업로드된 이미지가 없습니다.");
        }

        File projectDir = new File(convertedDir + "/" + projectId + "/OGQ");

        // 1. 기존 OGQ 변환 파일 삭제
        deleteDirectoryFiles(projectDir);

        // 2. 기존 OGQ 변환 DB 데이터 삭제
        convertedImageRepository.deleteByProjectIdAndPlatformName(projectId, "OGQ");

        // 3. 폴더 다시 생성
        if (!projectDir.exists()) {
            projectDir.mkdirs();
        }

        List<ConvertedImage> result = new ArrayList<>();

        int order = 1;

        for (UploadedImage uploadedImage : uploadedImages) {
            try {
                File originalFile = new File(uploadedImage.getStoredFilePath());

                BufferedImage original = ImageIO.read(originalFile);

                if (original == null) {
                    throw new RuntimeException("이미지 파일을 읽을 수 없습니다: " + uploadedImage.getOriginalFileName());
                }

                BufferedImage resized = ImageResizeUtil.resizeToCanvas(original, 740, 640);

                String fileName = String.format("ogq_%02d.png", order);
                File outputFile = new File(projectDir, fileName);

                ImageIO.write(resized, "png", outputFile);

                ConvertedImage convertedImage = new ConvertedImage();
                convertedImage.setProjectId(projectId);
                convertedImage.setPlatformName("OGQ");
                convertedImage.setItemType("STICKER");
                convertedImage.setConvertedFileName(fileName);
                convertedImage.setConvertedFilePath(outputFile.getAbsolutePath());
                convertedImage.setWidth(740);
                convertedImage.setHeight(640);
                convertedImage.setFileSize(outputFile.length());
                convertedImage.setSortOrder(order);

                ConvertedImage saved = convertedImageRepository.save(convertedImage);
                result.add(saved);

                order++;

            } catch (Exception e) {
                throw new RuntimeException("OGQ 변환 실패: " + uploadedImage.getOriginalFileName(), e);
            }
        }

        return result;
    }

    private void deleteDirectoryFiles(File directory) {
        if (!directory.exists()) {
            return;
        }

        File[] files = directory.listFiles();

        if (files == null) {
            return;
        }

        for (File file : files) {
            if (file.isDirectory()) {
                deleteDirectoryFiles(file);
            }

            file.delete();
        }
    }
}