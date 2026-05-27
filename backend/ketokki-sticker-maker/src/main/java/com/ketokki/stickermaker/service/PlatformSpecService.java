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
        /*
         * LINE 정지형 스티커 기준
         *
         * - 스티커 이미지: 370 x 320 px 이하
         * - 메인 이미지: 240 x 240 px
         * - 탭 이미지: 96 x 74 px
         * - PNG
         * - 각 이미지 1MB 이하
         * - 가로/세로 짝수 픽셀 권장/필수
         *
         * 현재 MVP에서는 스티커 이미지를 370 x 320 캔버스로 변환합니다.
         */
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
                "MOHEEM",
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
                "MOHEEM",
                "moheem",
                false,
                "MOHEEM_PLUS"
        );
    }

    private PlatformSpec getMoheemBasicSpec() {
        return new PlatformSpec(
                "MOHEEM",
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
                "MOHEEM",
                "moheem",
                false,
                "MOHEEM_BASIC"
        );
    }
}