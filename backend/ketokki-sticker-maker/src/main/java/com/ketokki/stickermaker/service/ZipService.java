package com.ketokki.stickermaker.service;

import com.ketokki.stickermaker.domain.ConvertedImage;
import com.ketokki.stickermaker.dto.PlatformSpec;
import com.ketokki.stickermaker.repository.ConvertedImageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@Service
@RequiredArgsConstructor
public class ZipService {

    private final ConvertedImageRepository convertedImageRepository;
    private final PlatformSpecService platformSpecService;

    @Value("${file.zip-dir}")
    private String zipDir;

    public File createOgqZip(Long projectId) {
        return createPlatformZip(projectId, "OGQ");
    }

    public File createPlatformZip(Long projectId, String specKey) {
        PlatformSpec spec = platformSpecService.getSpec(specKey);

        String platformKey =
                spec.getSubmissionType() != null
                        ? spec.getSubmissionType()
                        : spec.getPlatformName();

        List<ConvertedImage> images =
                convertedImageRepository.findByProjectIdAndPlatformNameOrderBySortOrderAsc(
                        projectId,
                        platformKey
                );

        if (images.isEmpty()) {
            throw new RuntimeException(
                    platformKey + " 변환 이미지가 없습니다. 먼저 변환을 진행해주세요."
            );
        }

        try {
            File projectZipDir = new File(zipDir + "/" + projectId);

            if (!projectZipDir.exists()) {
                projectZipDir.mkdirs();
            }

            File zipFile = new File(
                    projectZipDir,
                    platformKey.toLowerCase() + "_submit.zip"
            );

            try (
                    FileOutputStream fos = new FileOutputStream(zipFile);
                    ZipOutputStream zos = new ZipOutputStream(fos)
            ) {
                for (ConvertedImage image : images) {
                    File sourceFile = new File(image.getConvertedFilePath());

                    if (!sourceFile.exists() || !sourceFile.isFile()) {
                        throw new RuntimeException(
                                "ZIP에 포함할 파일이 실제 폴더에 없습니다: "
                                        + image.getConvertedFileName()
                        );
                    }

                    String zipEntryName =
                            platformKey + "/" + image.getConvertedFileName();

                    ZipEntry zipEntry = new ZipEntry(zipEntryName);
                    zos.putNextEntry(zipEntry);

                    try (FileInputStream fis = new FileInputStream(sourceFile)) {
                        byte[] buffer = new byte[1024];
                        int length;

                        while ((length = fis.read(buffer)) > 0) {
                            zos.write(buffer, 0, length);
                        }
                    }

                    zos.closeEntry();
                }
            }

            return zipFile;

        } catch (Exception e) {
            throw new RuntimeException("ZIP 파일 생성 실패: " + e.getMessage(), e);
        }
    }
}