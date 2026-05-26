package com.ketokki.stickermaker.service;

import com.ketokki.stickermaker.domain.ConvertedImage;
import com.ketokki.stickermaker.dto.OgqValidationResponse;
import com.ketokki.stickermaker.dto.ValidationItem;
import com.ketokki.stickermaker.repository.ConvertedImageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.File;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class OgqValidationService {

    private final ConvertedImageRepository convertedImageRepository;

    @Value("${file.converted-dir}")
    private String convertedDir;

    private static final int OGQ_STICKER_WIDTH = 740;
    private static final int OGQ_STICKER_HEIGHT = 640;
    private static final int OGQ_MAIN_WIDTH = 240;
    private static final int OGQ_MAIN_HEIGHT = 240;
    private static final int OGQ_TAB_WIDTH = 96;
    private static final int OGQ_TAB_HEIGHT = 74;
    private static final long MAX_FILE_SIZE_BYTES = 1024 * 1024;

    public OgqValidationResponse validateOgq(Long projectId) {
        List<ValidationItem> items = new ArrayList<>();

        File ogqDir = new File(convertedDir + "/" + projectId + "/OGQ");

        if (!ogqDir.exists()) {
            items.add(new ValidationItem(
                    "OGQ 폴더",
                    "FOLDER_EXISTS",
                    false,
                    "OGQ 변환 결과 폴더가 없습니다.",
                    ogqDir.getAbsolutePath(),
                    "폴더 없음"
            ));
            return buildResponse(projectId, items);
        }

        // ★ 수정: OGQ 플랫폼 + STICKER 타입만 필터링
        List<ConvertedImage> convertedImages =
                convertedImageRepository
                        .findByProjectIdAndPlatformNameAndItemTypeOrderBySortOrderAsc(
                                projectId, "OGQ", "STICKER"
                        );

        Map<String, ConvertedImage> imageMap = new LinkedHashMap<>();
        for (ConvertedImage image : convertedImages) {
            imageMap.put(image.getConvertedFileName(), image);
        }

        validateStickerCount(imageMap, items);
        validateStickerImages(imageMap, items);

        validateRequiredFile(ogqDir, "main.png", OGQ_MAIN_WIDTH, OGQ_MAIN_HEIGHT, items);
        validateRequiredFile(ogqDir, "tab.png", OGQ_TAB_WIDTH, OGQ_TAB_HEIGHT, items);

        return buildResponse(projectId, items);
    }

    private void validateStickerCount(
            Map<String, ConvertedImage> imageMap,
            List<ValidationItem> items
    ) {
        int stickerCount = 0;
        for (String fileName : imageMap.keySet()) {
            if (fileName != null && fileName.matches("ogq_\\d{2}\\.png")) {
                stickerCount++;
            }
        }

        boolean valid = stickerCount == 24;
        items.add(new ValidationItem(
                "OGQ 스티커 개수",
                "STICKER_COUNT",
                valid,
                valid ? "스티커 개수 정상" : "스티커 개수가 부족하거나 많습니다.",
                "24개",
                stickerCount + "개"
        ));
    }

    private void validateStickerImages(
            Map<String, ConvertedImage> imageMap,
            List<ValidationItem> items
    ) {
        for (ConvertedImage image : imageMap.values()) {
            String fileName = image.getConvertedFileName();

            if (fileName == null || !fileName.matches("ogq_\\d{2}\\.png")) {
                continue;
            }

            File file = new File(image.getConvertedFilePath());

            validateFileExists(fileName, file, items);

            if (file.exists()) {
                validateImageSize(fileName, file, OGQ_STICKER_WIDTH, OGQ_STICKER_HEIGHT, items);
                validateFileSize(fileName, file, items);
                validatePngFileName(fileName, items);
            }
        }
    }

    private void validateRequiredFile(
            File ogqDir,
            String fileName,
            int expectedWidth,
            int expectedHeight,
            List<ValidationItem> items
    ) {
        File file = new File(ogqDir, fileName);

        validateFileExists(fileName, file, items);

        if (file.exists()) {
            validateImageSize(fileName, file, expectedWidth, expectedHeight, items);
            validateFileSize(fileName, file, items);
            validatePngFileName(fileName, items);
        }
    }

    private void validateFileExists(
            String fileName,
            File file,
            List<ValidationItem> items
    ) {
        boolean exists = file.exists();
        items.add(new ValidationItem(
                fileName,
                "FILE_EXISTS",
                exists,
                exists ? "파일 존재" : "파일이 없습니다.",
                "파일 존재",
                exists ? "존재함" : "없음"
        ));
    }

    private void validateImageSize(
            String fileName,
            File file,
            int expectedWidth,
            int expectedHeight,
            List<ValidationItem> items
    ) {
        try {
            BufferedImage image = ImageIO.read(file);

            if (image == null) {
                items.add(new ValidationItem(
                        fileName, "IMAGE_READ", false,
                        "이미지 파일을 읽을 수 없습니다.", "읽기 가능", "읽기 실패"
                ));
                return;
            }

            String expected = expectedWidth + "x" + expectedHeight;
            String actual = image.getWidth() + "x" + image.getHeight();
            boolean valid = image.getWidth() == expectedWidth
                    && image.getHeight() == expectedHeight;

            items.add(new ValidationItem(
                    fileName, "SIZE", valid,
                    valid ? "이미지 크기 정상" : "이미지 크기가 맞지 않습니다.",
                    expected, actual
            ));

        } catch (Exception e) {
            items.add(new ValidationItem(
                    fileName, "SIZE", false,
                    "이미지 크기 검사 중 오류가 발생했습니다.",
                    expectedWidth + "x" + expectedHeight, "검사 실패"
            ));
        }
    }

    private void validateFileSize(
            String fileName,
            File file,
            List<ValidationItem> items
    ) {
        long fileSize = file.length();
        boolean valid = fileSize <= MAX_FILE_SIZE_BYTES;

        items.add(new ValidationItem(
                fileName, "FILE_SIZE", valid,
                valid ? "파일 용량 정상" : "파일 용량이 1MB를 초과했습니다.",
                "1MB 이하",
                fileSize + " bytes"
        ));
    }

    private void validatePngFileName(
            String fileName,
            List<ValidationItem> items
    ) {
        boolean valid = fileName.toLowerCase().endsWith(".png");

        items.add(new ValidationItem(
                fileName, "FORMAT", valid,
                valid ? "PNG 형식 정상" : "PNG 파일이 아닙니다.",
                "PNG",
                valid ? "PNG" : fileName
        ));
    }

    private OgqValidationResponse buildResponse(
            Long projectId,
            List<ValidationItem> items
    ) {
        int totalCount = items.size();
        int successCount = 0;

        for (ValidationItem item : items) {
            if (item.isValid()) {
                successCount++;
            }
        }

        int failCount = totalCount - successCount;
        int totalScore = totalCount == 0
                ? 0
                : (int) Math.round((successCount * 100.0) / totalCount);

        OgqValidationResponse response = new OgqValidationResponse();
        response.setProjectId(projectId);
        response.setPlatformName("OGQ");
        response.setTotalCount(totalCount);
        response.setSuccessCount(successCount);
        response.setFailCount(failCount);
        response.setTotalScore(totalScore);
        response.setValid(failCount == 0);
        response.setItems(items);

        return response;
    }
}