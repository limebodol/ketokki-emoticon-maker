package com.ketokki.stickermaker.dto;

import com.ketokki.stickermaker.domain.ConvertedImage;
import com.ketokki.stickermaker.domain.Project;
import com.ketokki.stickermaker.domain.UploadedImage;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ProjectDetailResponse {

    private Project project;
    private List<UploadedImage> uploadedImages;
    private List<ConvertedImage> convertedImages;

    public ProjectDetailResponse(
            Project project,
            List<UploadedImage> uploadedImages,
            List<ConvertedImage> convertedImages
    ) {
        this.project = project;
        this.uploadedImages = uploadedImages;
        this.convertedImages = convertedImages;
    }
}