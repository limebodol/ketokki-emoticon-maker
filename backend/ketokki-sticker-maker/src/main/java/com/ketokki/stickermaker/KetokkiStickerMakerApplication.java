package com.ketokki.stickermaker;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
public class KetokkiStickerMakerApplication {

    public static void main(String[] args) {
        SpringApplication.run(KetokkiStickerMakerApplication.class, args);
    }
}