package com.ketokki.stickermaker.controller;

import com.ketokki.stickermaker.domain.Project;
import com.ketokki.stickermaker.dto.ProjectCreateRequest;
import com.ketokki.stickermaker.service.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @PostMapping
    public Project createProject(@RequestBody ProjectCreateRequest request) {
        return projectService.createProject(request);
    }
}