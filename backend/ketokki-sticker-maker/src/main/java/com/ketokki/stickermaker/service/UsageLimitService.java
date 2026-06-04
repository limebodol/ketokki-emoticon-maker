package com.ketokki.stickermaker.service;

import com.ketokki.stickermaker.domain.UsageLimit;
import com.ketokki.stickermaker.repository.UsageLimitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class UsageLimitService {

    private static final String ACTION_CONVERT = "CONVERT";

    private final UsageLimitRepository usageLimitRepository;

    @Value("${usage.convert.daily-limit:5}")
    private int dailyConvertLimit;

    @Transactional(readOnly = true)
    public void checkConvertLimit(String clientIp) {
        LocalDate today = LocalDate.now();

        UsageLimit usageLimit = usageLimitRepository
                .findByClientIpAndActionTypeAndUsedDate(clientIp, ACTION_CONVERT, today)
                .orElse(null);

        int currentCount = usageLimit == null ? 0 : usageLimit.getUsageCount();

        if (currentCount >= dailyConvertLimit) {
            throw new IllegalArgumentException(
                    "무료 체험 버전은 하루 최대 "
                            + dailyConvertLimit
                            + "회까지만 변환할 수 있습니다. 내일 다시 이용해주세요."
            );
        }
    }

    @Transactional
    public void increaseConvertCount(String clientIp) {
        LocalDate today = LocalDate.now();

        UsageLimit usageLimit = usageLimitRepository
                .findByClientIpAndActionTypeAndUsedDate(clientIp, ACTION_CONVERT, today)
                .orElseGet(() -> new UsageLimit(clientIp, ACTION_CONVERT, today));

        usageLimit.increaseCount();

        usageLimitRepository.save(usageLimit);
    }

    @Transactional(readOnly = true)
    public int getTodayConvertCount(String clientIp) {
        LocalDate today = LocalDate.now();

        return usageLimitRepository
                .findByClientIpAndActionTypeAndUsedDate(clientIp, ACTION_CONVERT, today)
                .map(UsageLimit::getUsageCount)
                .orElse(0);
    }

    public int getDailyConvertLimit() {
        return dailyConvertLimit;
    }
}