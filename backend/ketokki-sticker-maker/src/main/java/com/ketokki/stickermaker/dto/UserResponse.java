package com.ketokki.stickermaker.dto;

import com.ketokki.stickermaker.domain.AppUser;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class UserResponse {

    private Long id;
    private String loginId;
    private String nickname;
    private LocalDateTime createdAt;

    public UserResponse(AppUser user) {
        this.id = user.getId();
        this.loginId = user.getLoginId();
        this.nickname = user.getNickname();
        this.createdAt = user.getCreatedAt();
    }
}