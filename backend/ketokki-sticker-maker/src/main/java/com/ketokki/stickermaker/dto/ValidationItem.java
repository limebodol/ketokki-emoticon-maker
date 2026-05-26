package com.ketokki.stickermaker.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ValidationItem {

    private String fileName;

    private String checkType;

    private boolean valid;

    private String message;

    private String expected;

    private String actual;

    public ValidationItem() {
    }

    public ValidationItem(
            String fileName,
            String checkType,
            boolean valid,
            String message,
            String expected,
            String actual
    ) {
        this.fileName = fileName;
        this.checkType = checkType;
        this.valid = valid;
        this.message = message;
        this.expected = expected;
        this.actual = actual;
    }
}