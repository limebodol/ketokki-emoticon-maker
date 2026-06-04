package com.ketokki.stickermaker.controller;

import com.ketokki.stickermaker.dto.UsageLimitStatusResponse;
import com.ketokki.stickermaker.service.UsageLimitService;
import com.ketokki.stickermaker.util.ClientIpUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/usage")
@RequiredArgsConstructor
public class UsageLimitController {

    private final UsageLimitService usageLimitService;

    @GetMapping("/convert/status")
    public UsageLimitStatusResponse getConvertUsageStatus(
            HttpServletRequest request
    ) {
        String clientIp = ClientIpUtil.getClientIp(request);

        int dailyLimit = usageLimitService.getDailyConvertLimit();
        int usedCount = usageLimitService.getTodayConvertCount(clientIp);
        int remainingCount = Math.max(dailyLimit - usedCount, 0);
        boolean available = remainingCount > 0;

        String message = available
                ? "오늘 변환 가능 횟수가 남아 있습니다."
                : "오늘 무료 변환 횟수를 모두 사용했습니다. 내일 다시 이용해주세요.";

        return new UsageLimitStatusResponse(
                dailyLimit,
                usedCount,
                remainingCount,
                available,
                message
        );
    }
}