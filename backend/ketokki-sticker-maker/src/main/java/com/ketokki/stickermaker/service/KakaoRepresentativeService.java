package com.ketokki.stickermaker.service;

import com.ketokki.stickermaker.domain.ConvertedImage;
import com.ketokki.stickermaker.dto.OgqRepresentativeResponse;
import com.ketokki.stickermaker.dto.PlatformSpec;
import com.ketokki.stickermaker.repository.ConvertedImageRepository;
import com.ketokki.stickermaker.util.ImageResizeUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.File;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class KakaoRepresentativeService {

    private final ConvertedImageRepository convertedImageRepository;
    private final PlatformSpecService platformSpecService;

    @Value("${file.converted-dir}")
    private String convertedDir;

    @Transactional
    public OgqRepresentativeResponse createRepresentativeImages(
            Long projectId,
            Integer selectedOrder
    ) {
        PlatformSpec spec = platformSpecService.getSpec("KAKAO");
        String platformKey = spec.getSubmissionType();

        validateSelectedOrder(projectId, selectedOrder, spec, platformKey);

        ConvertedImage selectedSticker = convertedImageRepository
                .findByProjectIdAndPlatformNameAndItemTypeAndSortOrder(
                        projectId,
                        platformKey,
                        "STICKER",
                        selectedOrder
                )
                .orElseThrow(() -> new RuntimeException(
                        "선택한 대표 스티커를 찾을 수 없습니다. 선택 번호: " + selectedOrder
                ));

        try {
            File stickerFile = new File(selectedSticker.getConvertedFilePath());

            if (!stickerFile.exists()) {
                throw new RuntimeException(
                        "대표 스티커 파일이 실제 폴더에 없습니다: "
                                + selectedSticker.getConvertedFileName()
                );
            }

            BufferedImage original = ImageIO.read(stickerFile);

            if (original == null) {
                throw new RuntimeException("대표 스티커 이미지를 읽을 수 없습니다.");
            }

            File platformDir = new File(
                    convertedDir + "/" + projectId + "/" + spec.getOutputFolderName()
            );

            if (!platformDir.exists()) {
                platformDir.mkdirs();
            }

            BufferedImage mainImageBuffered = ImageResizeUtil.resizeToCanvas(
                    original,
                    spec.getMainWidth(),
                    spec.getMainHeight()
            );

            BufferedImage tabImageBuffered = ImageResizeUtil.resizeToCanvas(
                    original,
                    spec.getTabWidth(),
                    spec.getTabHeight()
            );

            File mainFile = new File(platformDir, "main.png");
            File tabFile = new File(platformDir, "tab.png");

            ImageIO.write(mainImageBuffered, "png", mainFile);
            ImageIO.write(tabImageBuffered, "png", tabFile);

            ConvertedImage mainImage = saveOrUpdateRepresentative(
                    projectId,
                    platformKey,
                    "MAIN",
                    "main.png",
                    mainFile,
                    spec.getMainWidth(),
                    spec.getMainHeight(),
                    selectedOrder
            );

            ConvertedImage tabImage = saveOrUpdateRepresentative(
                    projectId,
                    platformKey,
                    "TAB",
                    "tab.png",
                    tabFile,
                    spec.getTabWidth(),
                    spec.getTabHeight(),
                    selectedOrder
            );

            OgqRepresentativeResponse response = new OgqRepresentativeResponse();
            response.setMainImage(mainImage);
            response.setTabImage(tabImage);

            return response;

        } catch (Exception e) {
            throw new RuntimeException("KAKAO 대표 이미지 생성 실패: " + e.getMessage(), e);
        }
    }

    private void validateSelectedOrder(
            Long projectId,
            Integer selectedOrder,
            PlatformSpec spec,
            String platformKey
    ) {
        if (selectedOrder == null) {
            throw new RuntimeException("대표컷 번호가 없습니다.");
        }

        if (selectedOrder < 1) {
            throw new RuntimeException(
                    "대표컷 번호는 1번 이상이어야 합니다. 현재 입력값: " + selectedOrder
            );
        }

        List<ConvertedImage> stickerImages =
                convertedImageRepository.findByProjectIdAndPlatformNameAndItemTypeOrderBySortOrderAsc(
                        projectId,
                        platformKey,
                        "STICKER"
                );

        if (stickerImages.isEmpty()) {
            throw new RuntimeException(
                    "KAKAO 변환된 스티커 이미지가 없습니다. 먼저 변환을 진행해주세요."
            );
        }

        int maxOrder = stickerImages.size();

        if (selectedOrder > maxOrder) {
            throw new RuntimeException(
                    "대표컷 번호가 변환된 이미지 개수를 초과했습니다. 현재 변환된 이미지 수: "
                            + maxOrder
                            + "개, 입력한 번호: "
                            + selectedOrder
            );
        }

        boolean exists = stickerImages.stream()
                .anyMatch(image -> selectedOrder.equals(image.getSortOrder()));

        if (!exists) {
            throw new RuntimeException(
                    "선택한 번호의 KAKAO 스티커 이미지가 없습니다. 선택 번호: "
                            + selectedOrder
            );
        }
    }

    private ConvertedImage saveOrUpdateRepresentative(
            Long projectId,
            String platformKey,
            String itemType,
            String fileName,
            File file,
            Integer width,
            Integer height,
            Integer selectedOrder
    ) {
        Optional<ConvertedImage> existing = convertedImageRepository
                .findByProjectIdAndPlatformNameAndItemType(
                        projectId,
                        platformKey,
                        itemType
                );

        ConvertedImage convertedImage = existing.orElse(new ConvertedImage());

        convertedImage.setProjectId(projectId);
        convertedImage.setPlatformName(platformKey);
        convertedImage.setItemType(itemType);
        convertedImage.setConvertedFileName(fileName);
        convertedImage.setConvertedFilePath(file.getAbsolutePath());
        convertedImage.setWidth(width);
        convertedImage.setHeight(height);
        convertedImage.setFileSize(file.length());
        convertedImage.setSortOrder(selectedOrder);

        return convertedImageRepository.save(convertedImage);
    }
}