package com.ketokki.stickermaker.repository;

import com.ketokki.stickermaker.domain.ConvertedImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ConvertedImageRepository extends JpaRepository<ConvertedImage, Long> {

    List<ConvertedImage> findByProjectIdOrderBySortOrderAsc(Long projectId);

    List<ConvertedImage> findByProjectIdAndPlatformNameAndItemTypeOrderBySortOrderAsc(
            Long projectId, String platformName, String itemType
    );

    Optional<ConvertedImage> findByProjectIdAndPlatformNameAndItemTypeAndSortOrder(
            Long projectId, String platformName, String itemType, Integer sortOrder
    );

    Optional<ConvertedImage> findByProjectIdAndPlatformNameAndItemType(
            Long projectId, String platformName, String itemType
    );

    void deleteByProjectIdAndPlatformName(Long projectId, String platformName);

    // ★ 추가: ZipService에서 사용
    List<ConvertedImage> findByProjectIdAndPlatformNameOrderBySortOrderAsc(
            Long projectId, String platformName
    );
}