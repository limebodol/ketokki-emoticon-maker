package com.ketokki.stickermaker.controller;

import com.ketokki.stickermaker.domain.UploadedImage;
import com.ketokki.stickermaker.service.ImageUploadService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ImageUploadController {

    private final ImageUploadService imageUploadService;

    @PostMapping("/{projectId}/images")
    public List<UploadedImage> uploadImages(
            @PathVariable("projectId") Long projectId,
            @RequestParam("files") MultipartFile[] files
    ) {
        return imageUploadService.uploadImages(projectId, files);
    }
}