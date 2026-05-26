package com.ketokki.stickermaker.controller;

import com.ketokki.stickermaker.dto.OgqRepresentativeResponse;
import com.ketokki.stickermaker.service.OgqRepresentativeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class OgqRepresentativeController {

    private final OgqRepresentativeService ogqRepresentativeService;

    @PostMapping("/{projectId}/representatives/ogq")
    public OgqRepresentativeResponse createRepresentativeImages(
            @PathVariable("projectId") Long projectId,
            @RequestParam("selectedOrder") Integer selectedOrder
    ) {
        return ogqRepresentativeService.createRepresentativeImages(projectId, selectedOrder);
    }
}