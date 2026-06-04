package com.ketokki.stickermaker.service;

import com.ketokki.stickermaker.domain.ConvertedImage;
import com.ketokki.stickermaker.domain.Project;
import com.ketokki.stickermaker.domain.UploadedImage;
import com.ketokki.stickermaker.dto.ProjectCreateRequest;
import com.ketokki.stickermaker.dto.ProjectDetailResponse;
import com.ketokki.stickermaker.dto.ProjectListResponse;
import com.ketokki.stickermaker.repository.AppUserRepository;
import com.ketokki.stickermaker.repository.ConvertedImageRepository;
import com.ketokki.stickermaker.repository.ProjectRepository;
import com.ketokki.stickermaker.repository.UploadedImageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final AppUserRepository appUserRepository;
    private final UploadedImageRepository uploadedImageRepository;
    private final ConvertedImageRepository convertedImageRepository;

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
        validateUser(userId);

        return projectRepository.findAllByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(ProjectListResponse::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProjectDetailResponse getProjectDetail(Long projectId, Long userId) {
        validateUser(userId);

        if (projectId == null) {
            throw new RuntimeException("프로젝트 번호가 없습니다.");
        }

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("존재하지 않는 프로젝트입니다."));

        if (project.getUserId() == null || !project.getUserId().equals(userId)) {
            throw new RuntimeException("해당 프로젝트를 열 수 있는 권한이 없습니다.");
        }

        List<UploadedImage> uploadedImages =
                uploadedImageRepository.findByProjectIdOrderBySortOrderAsc(projectId);

        List<ConvertedImage> convertedImages =
                convertedImageRepository.findByProjectIdOrderBySortOrderAsc(projectId);

        return new ProjectDetailResponse(project, uploadedImages, convertedImages);
    }

    private void validateUser(Long userId) {
        if (userId == null) {
            throw new RuntimeException("로그인한 사용자만 사용할 수 있습니다.");
        }

        if (!appUserRepository.existsById(userId)) {
            throw new RuntimeException("존재하지 않는 사용자입니다.");
        }
    }

    private void validateCreateRequest(ProjectCreateRequest request) {
        if (request == null) {
            throw new RuntimeException("프로젝트 생성 정보가 없습니다.");
        }

        validateUser(request.getUserId());

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