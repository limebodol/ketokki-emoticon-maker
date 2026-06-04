package com.ketokki.stickermaker.service;

import com.ketokki.stickermaker.domain.AppUser;
import com.ketokki.stickermaker.dto.LoginRequest;
import com.ketokki.stickermaker.dto.LoginResponse;
import com.ketokki.stickermaker.dto.SignupRequest;
import com.ketokki.stickermaker.dto.UserResponse;
import com.ketokki.stickermaker.repository.AppUserRepository;
import com.ketokki.stickermaker.util.PasswordUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AppUserRepository appUserRepository;

    @Transactional
    public LoginResponse signup(SignupRequest request) {
        validateSignupRequest(request);

        String loginId = request.getLoginId().trim();

        if (appUserRepository.existsByLoginId(loginId)) {
            throw new RuntimeException("이미 사용 중인 아이디입니다.");
        }

        AppUser user = new AppUser();
        user.setLoginId(loginId);
        user.setPasswordHash(PasswordUtil.hash(request.getPassword()));
        user.setNickname(request.getNickname().trim());

        AppUser savedUser = appUserRepository.save(user);

        return new LoginResponse(savedUser);
    }

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        validateLoginRequest(request);

        String loginId = request.getLoginId().trim();

        AppUser user = appUserRepository.findByLoginId(loginId)
                .orElseThrow(() -> new RuntimeException("아이디 또는 비밀번호가 올바르지 않습니다."));

        if (!PasswordUtil.matches(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("아이디 또는 비밀번호가 올바르지 않습니다.");
        }

        return new LoginResponse(user);
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getUsers() {
        return appUserRepository.findAll()
                .stream()
                .map(UserResponse::new)
                .toList();
    }

    private void validateSignupRequest(SignupRequest request) {
        if (request == null) {
            throw new RuntimeException("회원가입 정보가 없습니다.");
        }

        if (request.getLoginId() == null || request.getLoginId().trim().isEmpty()) {
            throw new RuntimeException("아이디를 입력해주세요.");
        }

        if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
            throw new RuntimeException("비밀번호를 입력해주세요.");
        }

        if (request.getPassword().length() < 4) {
            throw new RuntimeException("비밀번호는 최소 4자 이상 입력해주세요.");
        }

        if (request.getNickname() == null || request.getNickname().trim().isEmpty()) {
            throw new RuntimeException("닉네임을 입력해주세요.");
        }
    }

    private void validateLoginRequest(LoginRequest request) {
        if (request == null) {
            throw new RuntimeException("로그인 정보가 없습니다.");
        }

        if (request.getLoginId() == null || request.getLoginId().trim().isEmpty()) {
            throw new RuntimeException("아이디를 입력해주세요.");
        }

        if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
            throw new RuntimeException("비밀번호를 입력해주세요.");
        }
    }
}