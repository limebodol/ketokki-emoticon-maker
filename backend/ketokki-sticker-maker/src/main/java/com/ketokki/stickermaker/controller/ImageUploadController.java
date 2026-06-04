package com.ketokki.stickermaker.controller;

import com.ketokki.stickermaker.domain.UploadedImage;
import com.ketokki.stickermaker.service.ImageUploadService;
import com.ketokki.stickermaker.service.UploadLimitService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ImageUploadController {

    private final ImageUploadService imageUploadService;
    private final UploadLimitService uploadLimitService;

    @PostMapping("/{projectId}/images")
    public List<UploadedImage> uploadImages(
            @PathVariable("projectId") Long projectId,
            @RequestParam("files") MultipartFile[] files
    ) {
        uploadLimitService.validateUploadFiles(Arrays.asList(files));

        return imageUploadService.uploadImages(projectId, files);
    }
}