package com.ketokki.stickermaker.repository;

import com.ketokki.stickermaker.domain.Project;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectRepository extends JpaRepository<Project, Long> {
}