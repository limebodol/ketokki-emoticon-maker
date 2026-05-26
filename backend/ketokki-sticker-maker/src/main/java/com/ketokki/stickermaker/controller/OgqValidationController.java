package com.ketokki.stickermaker.controller;

import com.ketokki.stickermaker.dto.OgqValidationResponse;
import com.ketokki.stickermaker.service.OgqValidationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class OgqValidationController {

    private final OgqValidationService ogqValidationService;

    @PostMapping("/{projectId}/validate/ogq")
    public OgqValidationResponse validateOgq(
            @PathVariable("projectId") Long projectId
    ) {
        return ogqValidationService.validateOgq(projectId);
    }
}