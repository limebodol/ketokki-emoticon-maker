package com.ketokki.stickermaker.repository;

import com.ketokki.stickermaker.domain.UsageLimit;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Optional;

public interface UsageLimitRepository extends JpaRepository<UsageLimit, Long> {

    Optional<UsageLimit> findByClientIpAndActionTypeAndUsedDate(
            String clientIp,
            String actionType,
            LocalDate usedDate
    );
}