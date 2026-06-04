package com.ketokki.stickermaker.controller;

import com.ketokki.stickermaker.dto.LoginRequest;
import com.ketokki.stickermaker.dto.LoginResponse;
import com.ketokki.stickermaker.dto.SignupRequest;
import com.ketokki.stickermaker.dto.UserResponse;
import com.ketokki.stickermaker.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/signup")
    public LoginResponse signup(@RequestBody SignupRequest request) {
        return authService.signup(request);
    }

    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @GetMapping("/users")
    public List<UserResponse> getUsers() {
        return authService.getUsers();
    }
}