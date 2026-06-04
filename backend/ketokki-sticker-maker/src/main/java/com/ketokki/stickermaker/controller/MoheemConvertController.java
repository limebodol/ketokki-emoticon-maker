package com.ketokki.stickermaker.controller;

import com.ketokki.stickermaker.domain.ConvertedImage;
import com.ketokki.stickermaker.service.MoheemConvertService;
import com.ketokki.stickermaker.service.UsageLimitService;
import com.ketokki.stickermaker.util.ClientIpUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class MoheemConvertController {

    private final MoheemConvertService moheemConvertService;
    private final UsageLimitService usageLimitService;

    @PostMapping({
            "/{projectId}/convert/MOHEEM_BASIC",
            "/{projectId}/convert/moheem_basic"
    })
    public List<ConvertedImage> convertToMoheemBasic(
            @PathVariable("projectId") Long projectId,
            HttpServletRequest request
    ) {
        return convert(projectId, "MOHEEM_BASIC", request);
    }

    @PostMapping({
            "/{projectId}/convert/MOHEEM_PLUS",
            "/{projectId}/convert/moheem_plus"
    })
    public List<ConvertedImage> convertToMoheemPlus(
            @PathVariable("projectId") Long projectId,
            HttpServletRequest request
    ) {
        return convert(projectId, "MOHEEM_PLUS", request);
    }

    private List<ConvertedImage> convert(
            Long projectId,
            String platformName,
            HttpServletRequest request
    ) {
        String clientIp = ClientIpUtil.getClientIp(request);

        usageLimitService.checkConvertLimit(clientIp);

        List<ConvertedImage> result =
                moheemConvertService.convertToMoheem(projectId, platformName);

        usageLimitService.increaseConvertCount(clientIp);

        return result;
    }
}