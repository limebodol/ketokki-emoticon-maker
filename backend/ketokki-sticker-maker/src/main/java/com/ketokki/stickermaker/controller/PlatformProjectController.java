package com.ketokki.stickermaker.controller;

import com.ketokki.stickermaker.domain.ConvertedImage;
import com.ketokki.stickermaker.dto.OgqRepresentativeResponse;
import com.ketokki.stickermaker.dto.OgqValidationResponse;
import com.ketokki.stickermaker.service.KakaoConvertService;
import com.ketokki.stickermaker.service.KakaoRepresentativeService;
import com.ketokki.stickermaker.service.KakaoValidationService;
import com.ketokki.stickermaker.service.LineConvertService;
import com.ketokki.stickermaker.service.LineRepresentativeService;
import com.ketokki.stickermaker.service.LineValidationService;
import com.ketokki.stickermaker.service.MoheemConvertService;
import com.ketokki.stickermaker.service.MoheemRepresentativeService;
import com.ketokki.stickermaker.service.MoheemValidationService;
import com.ketokki.stickermaker.service.OgqConvertService;
import com.ketokki.stickermaker.service.OgqRepresentativeService;
import com.ketokki.stickermaker.service.OgqValidationService;
import com.ketokki.stickermaker.service.ZipService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.net.MalformedURLException;
import java.util.List;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class PlatformProjectController {

    private final OgqConvertService ogqConvertService;
    private final OgqRepresentativeService ogqRepresentativeService;
    private final OgqValidationService ogqValidationService;

    private final MoheemConvertService moheemConvertService;
    private final MoheemRepresentativeService moheemRepresentativeService;
    private final MoheemValidationService moheemValidationService;

    private final KakaoConvertService kakaoConvertService;
    private final KakaoRepresentativeService kakaoRepresentativeService;
    private final KakaoValidationService kakaoValidationService;

    private final LineConvertService lineConvertService;
    private final LineRepresentativeService lineRepresentativeService;
    private final LineValidationService lineValidationService;

    private final ZipService zipService;

    @PostMapping("/{projectId}/convert/{platformName}")
    public List<ConvertedImage> convertByPlatform(
            @PathVariable("projectId") Long projectId,
            @PathVariable("platformName") String platformName
    ) {
        String normalizedPlatformName = normalizePlatformName(platformName);

        if ("OGQ".equals(normalizedPlatformName)) {
            return ogqConvertService.convertToOgq(projectId);
        }

        if (isMoheem(normalizedPlatformName)) {
            return moheemConvertService.convertToMoheem(projectId, normalizedPlatformName);
        }

        if (isKakao(normalizedPlatformName)) {
            return kakaoConvertService.convertToKakao(projectId);
        }

        if (isLine(normalizedPlatformName)) {
            return lineConvertService.convertToLine(projectId);
        }

        throw new RuntimeException(
                normalizedPlatformName + " 변환 기능은 아직 준비 중입니다."
        );
    }

    @PostMapping("/{projectId}/representatives/{platformName}")
    public OgqRepresentativeResponse createRepresentativeByPlatform(
            @PathVariable("projectId") Long projectId,
            @PathVariable("platformName") String platformName,
            @RequestParam("selectedOrder") Integer selectedOrder
    ) {
        String normalizedPlatformName = normalizePlatformName(platformName);

        if ("OGQ".equals(normalizedPlatformName)) {
            return ogqRepresentativeService.createRepresentativeImages(projectId, selectedOrder);
        }

        if (isMoheem(normalizedPlatformName)) {
            return moheemRepresentativeService.createRepresentativeImages(
                    projectId,
                    normalizedPlatformName,
                    selectedOrder
            );
        }

        if (isKakao(normalizedPlatformName)) {
            return kakaoRepresentativeService.createRepresentativeImages(
                    projectId,
                    selectedOrder
            );
        }

        if (isLine(normalizedPlatformName)) {
            return lineRepresentativeService.createRepresentativeImages(
                    projectId,
                    selectedOrder
            );
        }

        throw new RuntimeException(
                normalizedPlatformName + " 대표 이미지 생성 기능은 아직 준비 중입니다."
        );
    }

    @PostMapping("/{projectId}/validate/{platformName}")
    public OgqValidationResponse validateByPlatform(
            @PathVariable("projectId") Long projectId,
            @PathVariable("platformName") String platformName
    ) {
        String normalizedPlatformName = normalizePlatformName(platformName);

        if ("OGQ".equals(normalizedPlatformName)) {
            return ogqValidationService.validateOgq(projectId);
        }

        if (isMoheem(normalizedPlatformName)) {
            return moheemValidationService.validateMoheem(projectId, normalizedPlatformName);
        }

        if (isKakao(normalizedPlatformName)) {
            return kakaoValidationService.validateKakao(projectId);
        }

        if (isLine(normalizedPlatformName)) {
            return lineValidationService.validateLine(projectId);
        }

        throw new RuntimeException(
                normalizedPlatformName + " 검수 기능은 아직 준비 중입니다."
        );
    }

    @GetMapping("/{projectId}/download/{platformName}")
    public ResponseEntity<Resource> downloadByPlatform(
            @PathVariable("projectId") Long projectId,
            @PathVariable("platformName") String platformName
    ) {
        String normalizedPlatformName = normalizePlatformName(platformName);

        if (!"OGQ".equals(normalizedPlatformName)
                && !isMoheem(normalizedPlatformName)
                && !isKakao(normalizedPlatformName)
                && !isLine(normalizedPlatformName)) {
            throw new RuntimeException(
                    normalizedPlatformName + " ZIP 다운로드 기능은 아직 준비 중입니다."
            );
        }

        try {
            File zipFile = zipService.createPlatformZip(projectId, normalizedPlatformName);

            if (!zipFile.exists() || !zipFile.isFile()) {
                throw new RuntimeException("ZIP 파일이 실제 폴더에 없습니다.");
            }

            Resource resource = new UrlResource(zipFile.toURI());

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .header(
                            HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" + zipFile.getName() + "\""
                    )
                    .body(resource);

        } catch (MalformedURLException e) {
            throw new RuntimeException("ZIP 파일 다운로드 실패: " + e.getMessage(), e);
        }
    }

    private String normalizePlatformName(String platformName) {
        if (platformName == null || platformName.trim().isEmpty()) {
            throw new RuntimeException("플랫폼명이 없습니다.");
        }

        return platformName.trim().toUpperCase();
    }

    private boolean isMoheem(String platformName) {
        return "MOHEEM".equals(platformName)
                || "MOHEEM_PLUS".equals(platformName)
                || "MOHEEM_BASIC".equals(platformName);
    }

    private boolean isKakao(String platformName) {
        return "KAKAO".equals(platformName)
                || "KAKAO_STATIC".equals(platformName);
    }

    private boolean isLine(String platformName) {
        return "LINE".equals(platformName)
                || "LINE_STATIC".equals(platformName);
    }
}