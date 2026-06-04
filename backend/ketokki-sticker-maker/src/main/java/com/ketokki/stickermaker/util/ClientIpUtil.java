package com.ketokki.stickermaker.util;

import jakarta.servlet.http.HttpServletRequest;

public class ClientIpUtil {

    private ClientIpUtil() {
    }

    public static String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");

        if (isValidHeader(xForwardedFor)) {
            return xForwardedFor.split(",")[0].trim();
        }

        String xRealIp = request.getHeader("X-Real-IP");

        if (isValidHeader(xRealIp)) {
            return xRealIp.trim();
        }

        String proxyClientIp = request.getHeader("Proxy-Client-IP");

        if (isValidHeader(proxyClientIp)) {
            return proxyClientIp.trim();
        }

        String wlProxyClientIp = request.getHeader("WL-Proxy-Client-IP");

        if (isValidHeader(wlProxyClientIp)) {
            return wlProxyClientIp.trim();
        }

        return request.getRemoteAddr();
    }

    private static boolean isValidHeader(String value) {
        return value != null
                && !value.isBlank()
                && !"unknown".equalsIgnoreCase(value);
    }
}