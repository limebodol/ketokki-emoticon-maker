package com.ketokki.stickermaker.service;

import com.ketokki.stickermaker.domain.ConvertedImage;
import com.ketokki.stickermaker.repository.ConvertedImageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@Service
@RequiredArgsConstructor
public class ZipService {

    private final ConvertedImageRepository convertedImageRepository;

    @Value("${file.zip-dir}")
    private String zipDir;

    public File createOgqZip(Long projectId) {
        try {
            File zipFolder = new File(zipDir);
            if (!zipFolder.exists()) {
                zipFolder.mkdirs();
            }

            File zipFile = new File(zipFolder, "ketokki_ogq_" + projectId + ".zip");

            // ★ 수정: OGQ 플랫폼만 필터링
            List<ConvertedImage> images =
                    convertedImageRepository
                            .findByProjectIdAndPlatformNameOrderBySortOrderAsc(
                                    projectId, "OGQ"
                            );

            if (images.isEmpty()) {
                throw new RuntimeException("ZIP으로 만들 변환 이미지가 없습니다.");
            }

            Map<String, ConvertedImage> fileMap = new LinkedHashMap<>();

            for (ConvertedImage image : images) {
                String fileName = image.getConvertedFileName();

                if (fileName == null) {
                    continue;
                }

                // ogq_01.png ~ ogq_24.png, main.png, tab.png 만 포함
                if (fileName.matches("ogq_\\d{2}\\.png")
                        || fileName.equals("main.png")
                        || fileName.equals("tab.png")) {
                    fileMap.put(fileName, image);
                }
            }

            if (fileMap.isEmpty()) {
                throw new RuntimeException("ZIP에 넣을 OGQ 파일이 없습니다.");
            }

            try (ZipOutputStream zos = new ZipOutputStream(new FileOutputStream(zipFile))) {
                for (ConvertedImage image : fileMap.values()) {
                    File file = new File(image.getConvertedFilePath());

                    if (!file.exists()) {
                        continue;
                    }

                    ZipEntry entry = new ZipEntry("OGQ/" + image.getConvertedFileName());
                    zos.putNextEntry(entry);

                    try (FileInputStream fis = new FileInputStream(file)) {
                        fis.transferTo(zos);
                    }

                    zos.closeEntry();
                }
            }

            return zipFile;

        } catch (Exception e) {
            throw new RuntimeException("OGQ ZIP 생성 실패", e);
        }
    }
}