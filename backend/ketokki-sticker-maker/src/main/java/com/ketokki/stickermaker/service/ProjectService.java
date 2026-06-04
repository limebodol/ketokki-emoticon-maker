package com.ketokki.stickermaker.service;

import com.ketokki.stickermaker.domain.Project;
import com.ketokki.stickermaker.dto.ProjectCreateRequest;
import com.ketokki.stickermaker.dto.ProjectListResponse;
import com.ketokki.stickermaker.repository.AppUserRepository;
import com.ketokki.stickermaker.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final AppUserRepository appUserRepository;

    @Transactional
    public Project createProject(ProjectCreateRequest request) {
        validateCreateRequest(request);

        Project project = new Project();

        project.setUserId(request.getUserId());
        project.setProjectName(request.getProjectName());
        project.setCharacterName(request.getCharacterName());
        project.setTargetPlatform(request.getTargetPlatform());
        project.setUploadType(request.getUploadType());
        project.setStatus("CREATED");

        return projectRepository.save(project);
    }

    @Transactional(readOnly = true)
    public List<ProjectListResponse> getProjectList(Long userId) {
        if (userId == null) {
            throw new RuntimeException("로그인한 사용자만 프로젝트 목록을 조회할 수 있습니다.");
        }

        if (!appUserRepository.existsById(userId)) {
            throw new RuntimeException("존재하지 않는 사용자입니다.");
        }

        return projectRepository.findAllByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(ProjectListResponse::new)
                .toList();
    }

    private void validateCreateRequest(ProjectCreateRequest request) {
        if (request == null) {
            throw new RuntimeException("프로젝트 생성 정보가 없습니다.");
        }

        if (request.getUserId() == null) {
            throw new RuntimeException("로그인 후 프로젝트를 생성할 수 있습니다.");
        }

        if (!appUserRepository.existsById(request.getUserId())) {
            throw new RuntimeException("존재하지 않는 사용자입니다.");
        }

        if (request.getProjectName() == null || request.getProjectName().trim().isEmpty()) {
            throw new RuntimeException("프로젝트명을 입력해주세요.");
        }

        if (request.getCharacterName() == null || request.getCharacterName().trim().isEmpty()) {
            throw new RuntimeException("캐릭터명을 입력해주세요.");
        }

        if (request.getTargetPlatform() == null || request.getTargetPlatform().trim().isEmpty()) {
            throw new RuntimeException("플랫폼을 선택해주세요.");
        }

        if (request.getUploadType() == null || request.getUploadType().trim().isEmpty()) {
            request.setUploadType("INDIVIDUAL");
        }
    }
}