package com.ketokki.stickermaker.dto;

import com.ketokki.stickermaker.domain.ConvertedImage;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OgqRepresentativeResponse {

    private ConvertedImage mainImage;
    private ConvertedImage tabImage;
}