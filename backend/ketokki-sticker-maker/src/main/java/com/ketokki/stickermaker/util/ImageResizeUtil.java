package com.ketokki.stickermaker.util;

import java.awt.AlphaComposite;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;

public class ImageResizeUtil {

    public static BufferedImage resizeToCanvas(
            BufferedImage original,
            int targetWidth,
            int targetHeight
    ) {
        double widthRatio = (double) targetWidth / original.getWidth();
        double heightRatio = (double) targetHeight / original.getHeight();

        // 원본 비율을 유지하면서 캔버스 안에 들어가도록 작은 비율 선택
        double scale = Math.min(widthRatio, heightRatio);

        int newWidth = (int) (original.getWidth() * scale);
        int newHeight = (int) (original.getHeight() * scale);

        // 투명 배경 캔버스 생성
        BufferedImage canvas = new BufferedImage(
                targetWidth,
                targetHeight,
                BufferedImage.TYPE_INT_ARGB
        );

        Graphics2D g = canvas.createGraphics();

        // 배경을 완전 투명으로 설정
        g.setComposite(AlphaComposite.Clear);
        g.fillRect(0, 0, targetWidth, targetHeight);

        // 이미지 그리기 설정
        g.setComposite(AlphaComposite.SrcOver);
        g.setRenderingHint(
                RenderingHints.KEY_INTERPOLATION,
                RenderingHints.VALUE_INTERPOLATION_BICUBIC
        );
        g.setRenderingHint(
                RenderingHints.KEY_RENDERING,
                RenderingHints.VALUE_RENDER_QUALITY
        );

        int x = (targetWidth - newWidth) / 2;
        int y = (targetHeight - newHeight) / 2;

        g.drawImage(original, x, y, newWidth, newHeight, null);
        g.dispose();

        return canvas;
    }
}