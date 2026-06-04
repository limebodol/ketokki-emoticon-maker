package com.ketokki.stickermaker.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.io.File;
import java.time.Duration;

@Slf4j
@Service
public class FileCleanupService {

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Value("${file.converted-dir}")
    private String convertedDir;

    @Value("${file.zip-dir}")
    private String zipDir;

    @Value("${file.cleanup.expire-minutes:60}")
    private long expireMinutes;

    /*
     * 10분마다 자동 실행됩니다.
     * 1시간이 지난 uploads / converted / zips 파일을 삭제합니다.
     */
    @Scheduled(fixedDelayString = "${file.cleanup.interval-millis:600000}")
    public void cleanupOldFiles() {
        long expireMillis = Duration.ofMinutes(expireMinutes).toMillis();
        long now = System.currentTimeMillis();

        log.info("파일 자동 삭제 작업 시작 - 보관 시간: {}분", expireMinutes);

        cleanupDirectory(new File(uploadDir), now, expireMillis);
        cleanupDirectory(new File(convertedDir), now, expireMillis);
        cleanupDirectory(new File(zipDir), now, expireMillis);

        log.info("파일 자동 삭제 작업 완료");
    }

    private void cleanupDirectory(File directory, long now, long expireMillis) {
        if (directory == null || !directory.exists()) {
            return;
        }

        if (!directory.isDirectory()) {
            return;
        }

        File[] files = directory.listFiles();

        if (files == null || files.length == 0) {
            return;
        }

        for (File file : files) {
            if (file.isDirectory()) {
                cleanupDirectory(file, now, expireMillis);
                deleteEmptyDirectory(file);
                continue;
            }

            deleteFileIfExpired(file, now, expireMillis);
        }
    }

    private void deleteFileIfExpired(File file, long now, long expireMillis) {
        long lastModified = file.lastModified();
        long ageMillis = now - lastModified;

        if (ageMillis < expireMillis) {
            return;
        }

        boolean deleted = file.delete();

        if (deleted) {
            log.info("오래된 파일 삭제 완료: {}", file.getAbsolutePath());
        } else {
            log.warn("오래된 파일 삭제 실패: {}", file.getAbsolutePath());
        }
    }

    private void deleteEmptyDirectory(File directory) {
        if (directory == null || !directory.exists() || !directory.isDirectory()) {
            return;
        }

        File[] files = directory.listFiles();

        if (files != null && files.length > 0) {
            return;
        }

        boolean deleted = directory.delete();

        if (deleted) {
            log.info("빈 폴더 삭제 완료: {}", directory.getAbsolutePath());
        }
    }
}