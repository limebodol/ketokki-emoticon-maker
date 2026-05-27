package com.ketokki.stickermaker.service;

import com.ketokki.stickermaker.domain.ConvertedImage;
import com.ketokki.stickermaker.domain.UploadedImage;
import com.ketokki.stickermaker.dto.PlatformSpec;
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
public class MoheemConvertService {

    private final UploadedImageRepository uploadedImageRepository;
    private final ConvertedImageRepository convertedImageRepository;
    private final PlatformSpecService platformSpecService;

    @Value("${file.converted-dir}")
    private String convertedDir;

    @Transactional
    public List<ConvertedImage> convertToMoheem(Long projectId, String specKey) {
        PlatformSpec spec = platformSpecService.getSpec(specKey);
        String platformKey = spec.getSubmissionType();

        List<UploadedImage> uploadedImages =
                uploadedImageRepository.findByProjectIdOrderBySortOrderAsc(projectId);

        if (uploadedImages.isEmpty()) {
            throw new RuntimeException("업로드된 이미지가 없습니다.");
        }

        validateStickerCount(uploadedImages.size(), spec);

        try {
            File platformDir = new File(
                    convertedDir + "/" + projectId + "/" + spec.getOutputFolderName()
            );

            if (!platformDir.exists()) {
                platformDir.mkdirs();
            }

            convertedImageRepository.deleteByProjectIdAndPlatformNameAndItemType(
                    projectId,
                    platformKey,
                    "STICKER"
            );

            List<ConvertedImage> convertedImages = new ArrayList<>();

            for (int i = 0; i < uploadedImages.size(); i++) {
                UploadedImage uploadedImage = uploadedImages.get(i);

                File originalFile = new File(uploadedImage.getStoredFilePath());

                if (!originalFile.exists()) {
                    throw new RuntimeException(
                            "원본 이미지 파일이 실제 폴더에 없습니다: "
                                    + uploadedImage.getOriginalFileName()
                    );
                }

                BufferedImage originalImage = ImageIO.read(originalFile);

                if (originalImage == null) {
                    throw new RuntimeException(
                            "이미지 파일을 읽을 수 없습니다: "
                                    + uploadedImage.getOriginalFileName()
                    );
                }

                BufferedImage resizedImage = ImageResizeUtil.resizeToCanvas(
                        originalImage,
                        spec.getStickerWidth(),
                        spec.getStickerHeight()
                );

                int sortOrder = i + 1;

                String convertedFileName = String.format(
                        "%s_%02d.png",
                        spec.getStickerFilePrefix(),
                        sortOrder
                );

                File convertedFile = new File(platformDir, convertedFileName);

                ImageIO.write(resizedImage, "png", convertedFile);

                ConvertedImage convertedImage = new ConvertedImage();
                convertedImage.setProjectId(projectId);
                convertedImage.setPlatformName(platformKey);
                convertedImage.setItemType("STICKER");
                convertedImage.setConvertedFileName(convertedFileName);
                convertedImage.setConvertedFilePath(convertedFile.getAbsolutePath());
                convertedImage.setWidth(spec.getStickerWidth());
                convertedImage.setHeight(spec.getStickerHeight());
                convertedImage.setFileSize(convertedFile.length());
                convertedImage.setSortOrder(sortOrder);

                convertedImages.add(convertedImageRepository.save(convertedImage));
            }

            return convertedImages;

        } catch (Exception e) {
            throw new RuntimeException("MOHEEM 변환 실패: " + e.getMessage(), e);
        }
    }

    private void validateStickerCount(int actualCount, PlatformSpec spec) {
        Integer minCount = spec.getMinStickerCount();
        Integer maxCount = spec.getMaxStickerCount();

        if (minCount != null && actualCount < minCount) {
            throw new RuntimeException(
                    spec.getSubmissionType()
                            + "은 최소 "
                            + minCount
                            + "개 이상의 스티커가 필요합니다. 현재: "
                            + actualCount
                            + "개"
            );
        }

        if (maxCount != null && actualCount > maxCount) {
            throw new RuntimeException(
                    spec.getSubmissionType()
                            + "은 최대 "
                            + maxCount
                            + "개까지만 등록할 수 있습니다. 현재: "
                            + actualCount
                            + "개"
            );
        }
    }
}