package com.ketokki.stickermaker.controller;

import com.ketokki.stickermaker.domain.ConvertedImage;
import com.ketokki.stickermaker.service.OgqConvertService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class OgqConvertController {

    private final OgqConvertService ogqConvertService;

    @PostMapping("/{projectId}/convert/ogq")
    public List<ConvertedImage> convertToOgq(
            @PathVariable("projectId") Long projectId
    ) {
        return ogqConvertService.convertToOgq(projectId);
    }
}