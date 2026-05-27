package com.ketokki.stickermaker.service;

import com.ketokki.stickermaker.domain.ConvertedImage;
import com.ketokki.stickermaker.dto.OgqValidationResponse;
import com.ketokki.stickermaker.dto.PlatformSpec;
import com.ketokki.stickermaker.dto.ValidationItem;
import com.ketokki.stickermaker.repository.ConvertedImageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.File;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MoheemValidationService {

    private final ConvertedImageRepository convertedImageRepository;
    private final PlatformSpecService platformSpecService;

    public OgqValidationResponse validateMoheem(Long projectId, String specKey) {
        PlatformSpec spec = platformSpecService.getSpec(specKey);
        String platformKey = spec.getSubmissionType();

        List<ValidationItem> items = new ArrayList<>();

        List<ConvertedImage> stickerImages =
                convertedImageRepository.findByProjectIdAndPlatformNameAndItemTypeOrderBySortOrderAsc(
                        projectId,
                        platformKey,
                        "STICKER"
                );

        validateStickerCount(items, stickerImages, spec);

        for (ConvertedImage image : stickerImages) {
            validateFileExists(items, image);
            validateImageSize(
                    items,
                    image,
                    spec.getStickerWidth(),
                    spec.getStickerHeight()
            );
            validateFileSize(items, image, spec.getMaxFileSizeBytes());
            validatePngFormat(items, image);
        }

        Optional<ConvertedImage> mainImage =
                convertedImageRepository.findByProjectIdAndPlatformNameAndItemType(
                        projectId,
                        platformKey,
                        "MAIN"
                );

        validateRepresentativeImage(
                items,
                mainImage,
                "main.png",
                spec.getMainWidth(),
                spec.getMainHeight(),
                spec.getMaxFileSizeBytes()
        );

        return buildResponse(projectId, spec, items);
    }

    private void validateStickerCount(
            List<ValidationItem> items,
            List<ConvertedImage> stickerImages,
            PlatformSpec spec
    ) {
        int actualCount = stickerImages.size();

        Integer minCount = spec.getMinStickerCount();
        Integer maxCount = spec.getMaxStickerCount();

        boolean valid = true;
        String expected;

        if (maxCount == null) {
            expected = minCount + "개 이상";
            valid = actualCount >= minCount;
        } else if (minCount.equals(maxCount)) {
            expected = minCount + "개";
            valid = actualCount == minCount;
        } else {
            expected = minCount + "개 ~ " + maxCount + "개";
            valid = actualCount >= minCount && actualCount <= maxCount;
        }

        items.add(new ValidationItem(
                spec.getSubmissionType() + " 스티커 개수",
                "STICKER_COUNT",
                valid,
                valid ? "스티커 개수 정상" : "스티커 개수가 제출 조건과 다릅니다.",
                expected,
                actualCount + "개"
        ));
    }

    private void validateFileExists(
            List<ValidationItem> items,
            ConvertedImage image
    ) {
        File file = new File(image.getConvertedFilePath());
        boolean valid = file.exists() && file.isFile();

        items.add(new ValidationItem(
                image.getConvertedFileName(),
                "FILE_EXISTS",
                valid,
                valid ? "파일 존재" : "파일이 실제 폴더에 없습니다.",
                "파일 존재",
                valid ? "존재함" : "없음"
        ));
    }

    private void validateImageSize(
            List<ValidationItem> items,
            ConvertedImage image,
            int expectedWidth,
            int expectedHeight
    ) {
        boolean valid =
                image.getWidth() == expectedWidth
                        && image.getHeight() == expectedHeight;

        items.add(new ValidationItem(
                image.getConvertedFileName(),
                "SIZE",
                valid,
                valid ? "이미지 크기 정상" : "이미지 크기가 규격과 다릅니다.",
                expectedWidth + "x" + expectedHeight,
                image.getWidth() + "x" + image.getHeight()
        ));
    }

    private void validateFileSize(
            List<ValidationItem> items,
            ConvertedImage image,
            long maxFileSizeBytes
    ) {
        boolean valid = image.getFileSize() <= maxFileSizeBytes;

        items.add(new ValidationItem(
                image.getConvertedFileName(),
                "FILE_SIZE",
                valid,
                valid ? "파일 용량 정상" : "파일 용량이 기준을 초과했습니다.",
                formatFileSize(maxFileSizeBytes) + " 이하",
                image.getFileSize() + " bytes"
        ));
    }

    private void validatePngFormat(
            List<ValidationItem> items,
            ConvertedImage image
    ) {
        String fileName = image.getConvertedFileName();
        boolean valid = fileName != null && fileName.toLowerCase().endsWith(".png");

        items.add(new ValidationItem(
                image.getConvertedFileName(),
                "FORMAT",
                valid,
                valid ? "PNG 형식 정상" : "PNG 형식이 아닙니다.",
                "PNG",
                valid ? "PNG" : "PNG 아님"
        ));
    }

    private void validateRepresentativeImage(
            List<ValidationItem> items,
            Optional<ConvertedImage> optionalImage,
            String expectedFileName,
            int expectedWidth,
            int expectedHeight,
            long maxFileSizeBytes
    ) {
        if (optionalImage.isEmpty()) {
            items.add(new ValidationItem(
                    expectedFileName,
                    "FILE_EXISTS",
                    false,
                    expectedFileName + " 파일이 없습니다.",
                    "파일 존재",
                    "없음"
            ));
            return;
        }

        ConvertedImage image = optionalImage.get();

        validateFileExists(items, image);
        validateImageSize(items, image, expectedWidth, expectedHeight);
        validateFileSize(items, image, maxFileSizeBytes);
        validatePngFormat(items, image);
    }

    private OgqValidationResponse buildResponse(
            Long projectId,
            PlatformSpec spec,
            List<ValidationItem> items
    ) {
        int totalCount = items.size();
        int successCount = 0;
        int failCount = 0;

        for (ValidationItem item : items) {
            if (item.isValid()) {
                successCount++;
            } else {
                failCount++;
            }
        }

        int totalScore = 0;

        if (totalCount > 0) {
            totalScore = (int) Math.round((successCount * 100.0) / totalCount);
        }

        OgqValidationResponse response = new OgqValidationResponse();
        response.setProjectId(projectId);
        response.setPlatformName(spec.getSubmissionType());
        response.setTotalCount(totalCount);
        response.setSuccessCount(successCount);
        response.setFailCount(failCount);
        response.setTotalScore(totalScore);
        response.setValid(failCount == 0);
        response.setItems(items);

        return response;
    }

    private String formatFileSize(long sizeBytes) {
        long oneMb = 1024L * 1024L;
        long oneKb = 1024L;

        if (sizeBytes % oneMb == 0) {
            return (sizeBytes / oneMb) + "MB";
        }

        if (sizeBytes % oneKb == 0) {
            return (sizeBytes / oneKb) + "KB";
        }

        return sizeBytes + " bytes";
    }
}