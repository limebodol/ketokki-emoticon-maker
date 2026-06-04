package com.ketokki.stickermaker.controller;

import com.ketokki.stickermaker.domain.ConvertedImage;
import com.ketokki.stickermaker.service.LineConvertService;
import com.ketokki.stickermaker.service.UsageLimitService;
import com.ketokki.stickermaker.util.ClientIpUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class LineConvertController {

    private final LineConvertService lineConvertService;
    private final UsageLimitService usageLimitService;

    @PostMapping({
            "/{projectId}/convert/line",
            "/{projectId}/convert/LINE"
    })
    public List<ConvertedImage> convertToLine(
            @PathVariable("projectId") Long projectId,
            HttpServletRequest request
    ) {
        String clientIp = ClientIpUtil.getClientIp(request);

        usageLimitService.checkConvertLimit(clientIp);

        List<ConvertedImage> result = lineConvertService.convertToLine(projectId);

        usageLimitService.increaseConvertCount(clientIp);

        return result;
    }
}