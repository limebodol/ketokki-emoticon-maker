package com.ketokki.stickermaker.controller;

import com.ketokki.stickermaker.service.ZipService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ZipDownloadController {

    private final ZipService zipService;

    @GetMapping("/{projectId}/download/ogq")
    public ResponseEntity<Resource> downloadOgqZip(
            @PathVariable("projectId") Long projectId
    ) {
        File zipFile = zipService.createOgqZip(projectId);

        Resource resource = new FileSystemResource(zipFile);

        String fileName = "ketokki_ogq_" + projectId + ".zip";
        String encodedFileName = URLEncoder.encode(fileName, StandardCharsets.UTF_8)
                .replaceAll("\\+", "%20");

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename*=UTF-8''" + encodedFileName
                )
                .body(resource);
    }
}