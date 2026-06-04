package com.ketokki.stickermaker.controller;

import com.ketokki.stickermaker.domain.ConvertedImage;
import com.ketokki.stickermaker.service.KakaoConvertService;
import com.ketokki.stickermaker.service.UsageLimitService;
import com.ketokki.stickermaker.util.ClientIpUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class KakaoConvertController {

    private final KakaoConvertService kakaoConvertService;
    private final UsageLimitService usageLimitService;

    @PostMapping({
            "/{projectId}/convert/kakao",
            "/{projectId}/convert/KAKAO"
    })
    public List<ConvertedImage> convertToKakao(
            @PathVariable("projectId") Long projectId,
            HttpServletRequest request
    ) {
        String clientIp = ClientIpUtil.getClientIp(request);

        usageLimitService.checkConvertLimit(clientIp);

        List<ConvertedImage> result = kakaoConvertService.convertToKakao(projectId);

        usageLimitService.increaseConvertCount(clientIp);

        return result;
    }
}