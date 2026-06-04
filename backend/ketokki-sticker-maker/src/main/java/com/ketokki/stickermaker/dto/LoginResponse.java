package com.ketokki.stickermaker.dto;

import com.ketokki.stickermaker.domain.AppUser;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginResponse {

    private Long userId;
    private String loginId;
    private String nickname;

    public LoginResponse(AppUser user) {
        this.userId = user.getId();
        this.loginId = user.getLoginId();
        this.nickname = user.getNickname();
    }
}