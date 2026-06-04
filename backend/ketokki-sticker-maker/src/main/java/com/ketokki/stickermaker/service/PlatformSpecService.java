package com.ketokki.stickermaker.service;

import com.ketokki.stickermaker.dto.PlatformSpec;
import org.springframework.stereotype.Service;

@Service
public class PlatformSpecService {

    private static final long ONE_MB = 1024L * 1024L;
    private static final long FIVE_HUNDRED_KB = 500L * 1024L;
    private static final long KAKAO_STATIC_MAX_SIZE = 150L * 1024L;

    public PlatformSpec getSpec(String platformName) {
        if (platformName == null || platformName.trim().isEmpty()) {
            throw new RuntimeException("플랫폼명이 없습니다.");
        }

        String normalizedPlatformName = platformName.trim().toUpperCase();

        switch (normalizedPlatformName) {
            case "OGQ":
                return getOgqSpec();

            case "KAKAO":
            case "KAKAO_STATIC":
                return getKakaoStaticSpec();

            case "LINE":
            case "LINE_STATIC":
                return getLineStaticSpec();

            case "MOHEEM":
            case "MOHEEM_PLUS":
                return getMoheemPlusSpec();

            case "MOHEEM_BASIC":
                return getMoheemBasicSpec();

            default:
                throw new RuntimeException("지원하지 않는 플랫폼입니다: " + platformName);
        }
    }

    private PlatformSpec getOgqSpec() {
        return new PlatformSpec(
                "OGQ",
                24,
                24,
                24,
                740,
                640,
                240,
                240,
                96,
                74,
                ONE_MB,
                "OGQ",
                "ogq",
                true,
                "OGQ"
        );
    }

    private PlatformSpec getKakaoStaticSpec() {
        return new PlatformSpec(
                "KAKAO",
                32,
                32,
                32,
                360,
                360,
                240,
                240,
                78,
                78,
                KAKAO_STATIC_MAX_SIZE,
                "KAKAO",
                "kakao",
                true,
                "KAKAO_STATIC"
        );
    }

    private PlatformSpec getLineStaticSpec() {
        return new PlatformSpec(
                "LINE",
                24,
                8,
                40,
                370,
                320,
                240,
                240,
                96,
                74,
                ONE_MB,
                "LINE",
                "line",
                true,
                "LINE_STATIC"
        );
    }

    private PlatformSpec getMoheemPlusSpec() {
        return new PlatformSpec(
                "MOHEEM_PLUS",
                24,
                24,
                null,
                618,
                618,
                250,
                250,
                0,
                0,
                FIVE_HUNDRED_KB,
                "MOHEEM_PLUS",
                "moheem_plus",
                false,
                "MOHEEM_PLUS"
        );
    }

    private PlatformSpec getMoheemBasicSpec() {
        return new PlatformSpec(
                "MOHEEM_BASIC",
                23,
                1,
                23,
                618,
                618,
                250,
                250,
                0,
                0,
                FIVE_HUNDRED_KB,
                "MOHEEM_BASIC",
                "moheem_basic",
                false,
                "MOHEEM_BASIC"
        );
    }
}