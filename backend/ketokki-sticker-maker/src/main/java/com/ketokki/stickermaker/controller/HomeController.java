package com.ketokki.stickermaker.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HomeController {

    @GetMapping("/")
    public String home() {
        return "케토끼 이모티콘 메이커 서버 실행 중!";
    }
}