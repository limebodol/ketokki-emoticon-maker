package com.ketokki.stickermaker.service;

import com.ketokki.stickermaker.domain.Project;
import com.ketokki.stickermaker.dto.ProjectCreateRequest;
import com.ketokki.stickermaker.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;

    public Project createProject(ProjectCreateRequest request) {
        Project project = new Project();

        project.setProjectName(request.getProjectName());
        project.setCharacterName(request.getCharacterName());
        project.setTargetPlatform(request.getTargetPlatform());
        project.setUploadType(request.getUploadType());
        project.setStatus("CREATED");

        return projectRepository.save(project);
    }
}