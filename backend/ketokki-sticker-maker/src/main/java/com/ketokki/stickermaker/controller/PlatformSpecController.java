package com.ketokki.stickermaker.controller;

import com.ketokki.stickermaker.dto.PlatformSpec;
import com.ketokki.stickermaker.service.PlatformSpecService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/platform-specs")
@RequiredArgsConstructor
public class PlatformSpecController {

    private final PlatformSpecService platformSpecService;

    @GetMapping("/{platformName}")
    public PlatformSpec getPlatformSpec(@PathVariable("platformName") String platformName) {
        return platformSpecService.getSpec(platformName);
    }
}