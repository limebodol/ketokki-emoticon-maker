package com.ketokki.stickermaker.repository;

import com.ketokki.stickermaker.domain.UploadedImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UploadedImageRepository extends JpaRepository<UploadedImage, Long> {

    List<UploadedImage> findByProjectIdOrderBySortOrderAsc(Long projectId);

    void deleteByProjectId(Long projectId);
}