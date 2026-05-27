package com.ketokki.stickermaker.repository;

import com.ketokki.stickermaker.domain.ConvertedImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ConvertedImageRepository extends JpaRepository<ConvertedImage, Long> {

    // 프로젝트 기준 전체 변환 이미지 조회
    List<ConvertedImage> findByProjectIdOrderBySortOrderAsc(Long projectId);

    // 프로젝트 + 플랫폼 기준 변환 이미지 조회
    List<ConvertedImage> findByProjectIdAndPlatformNameOrderBySortOrderAsc(
            Long projectId,
            String platformName
    );

    // 프로젝트 + 플랫폼 + 이미지 구분 기준 조회
    // 예: OGQ / STICKER만 조회
    List<ConvertedImage> findByProjectIdAndPlatformNameAndItemTypeOrderBySortOrderAsc(
            Long projectId,
            String platformName,
            String itemType
    );

    // 프로젝트 + 플랫폼 + 이미지 구분 기준 단일 조회
    // 예: OGQ / MAIN 또는 OGQ / TAB 조회
    Optional<ConvertedImage> findByProjectIdAndPlatformNameAndItemType(
            Long projectId,
            String platformName,
            String itemType
    );

    // 프로젝트 + 플랫폼 + 이미지 구분 + 순서 기준 단일 조회
    // 예: OGQ / STICKER / 1번 이미지 조회
    Optional<ConvertedImage> findByProjectIdAndPlatformNameAndItemTypeAndSortOrder(
            Long projectId,
            String platformName,
            String itemType,
            Integer sortOrder
    );

    // 프로젝트 + 플랫폼 + 이미지 구분 기준 삭제
    // 예: OGQ / STICKER 기존 변환 결과 삭제
    void deleteByProjectIdAndPlatformNameAndItemType(
            Long projectId,
            String platformName,
            String itemType
    );
}