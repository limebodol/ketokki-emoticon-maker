package com.ketokki.stickermaker.service;

import com.ketokki.stickermaker.domain.ConvertedImage;
import com.ketokki.stickermaker.dto.OgqRepresentativeResponse;
import com.ketokki.stickermaker.repository.ConvertedImageRepository;
import com.ketokki.stickermaker.util.ImageResizeUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.File;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class OgqRepresentativeService {

    private final ConvertedImageRepository convertedImageRepository;

    @Value("${file.converted-dir}")
    private String convertedDir;

    public OgqRepresentativeResponse createRepresentativeImages(Long projectId, Integer selectedOrder) {

        validateSelectedOrder(projectId, selectedOrder);

        ConvertedImage selectedSticker = convertedImageRepository
                .findByProjectIdAndPlatformNameAndItemTypeAndSortOrder(
                        projectId, "OGQ", "STICKER", selectedOrder
                )
                .orElseThrow(() -> new RuntimeException(
                        "선택한 대표 스티커를 찾을 수 없습니다. 선택 번호: " + selectedOrder
                ));

        try {
            File stickerFile = new File(selectedSticker.getConvertedFilePath());

            if (!stickerFile.exists()) {
                throw new RuntimeException(
                        "대표 스티커 파일이 실제 폴더에 없습니다: " + selectedSticker.getConvertedFileName()
                );
            }

            BufferedImage original = ImageIO.read(stickerFile);

            if (original == null) {
                throw new RuntimeException("대표 스티커 이미지를 읽을 수 없습니다.");
            }

            File ogqDir = new File(convertedDir + "/" + projectId + "/OGQ");
            if (!ogqDir.exists()) {
                ogqDir.mkdirs();
            }

            BufferedImage mainImageBuffered = ImageResizeUtil.resizeToCanvas(original, 240, 240);
            BufferedImage tabImageBuffered = ImageResizeUtil.resizeToCanvas(original, 96, 74);

            File mainFile = new File(ogqDir, "main.png");
            File tabFile = new File(ogqDir, "tab.png");

            ImageIO.write(mainImageBuffered, "png", mainFile);
            ImageIO.write(tabImageBuffered, "png", tabFile);

            ConvertedImage mainImage = saveOrUpdateRepresentative(
                    projectId,
                    "OGQ",
                    "MAIN",
                    "main.png",
                    mainFile,
                    240,
                    240,
                    selectedOrder
            );

            ConvertedImage tabImage = saveOrUpdateRepresentative(
                    projectId,
                    "OGQ",
                    "TAB",
                    "tab.png",
                    tabFile,
                    96,
                    74,
                    selectedOrder
            );

            OgqRepresentativeResponse response = new OgqRepresentativeResponse();
            response.setMainImage(mainImage);
            response.setTabImage(tabImage);

            return response;

        } catch (Exception e) {
            throw new RuntimeException("대표 이미지 생성 실패: " + e.getMessage(), e);
        }
    }

    private void validateSelectedOrder(Long projectId, Integer selectedOrder) {
        if (selectedOrder == null) {
            throw new RuntimeException("대표컷 번호가 없습니다.");
        }

        if (selectedOrder < 1) {
            throw new RuntimeException("대표컷 번호는 1번 이상이어야 합니다. 현재 입력값: " + selectedOrder);
        }

        List<ConvertedImage> stickerImages =
                convertedImageRepository.findByProjectIdAndPlatformNameAndItemTypeOrderBySortOrderAsc(
                        projectId,
                        "OGQ",
                        "STICKER"
                );

        if (stickerImages.isEmpty()) {
            throw new RuntimeException("OGQ 변환된 스티커 이미지가 없습니다. 먼저 OGQ 변환을 진행해주세요.");
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
            throw new RuntimeException("선택한 번호의 OGQ 스티커 이미지가 없습니다. 선택 번호: " + selectedOrder);
        }
    }

    private ConvertedImage saveOrUpdateRepresentative(
            Long projectId,
            String platformName,
            String itemType,
            String fileName,
            File file,
            Integer width,
            Integer height,
            Integer selectedOrder
    ) {
        Optional<ConvertedImage> existing = convertedImageRepository
                .findByProjectIdAndPlatformNameAndItemType(projectId, platformName, itemType);

        ConvertedImage convertedImage = existing.orElse(new ConvertedImage());

        convertedImage.setProjectId(projectId);
        convertedImage.setPlatformName(platformName);
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