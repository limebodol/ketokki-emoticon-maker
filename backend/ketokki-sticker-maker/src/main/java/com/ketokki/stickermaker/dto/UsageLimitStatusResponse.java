package com.ketokki.stickermaker.dto;

public class UsageLimitStatusResponse {

    private int dailyLimit;
    private int usedCount;
    private int remainingCount;
    private boolean available;
    private String message;

    public UsageLimitStatusResponse() {
    }

    public UsageLimitStatusResponse(
            int dailyLimit,
            int usedCount,
            int remainingCount,
            boolean available,
            String message
    ) {
        this.dailyLimit = dailyLimit;
        this.usedCount = usedCount;
        this.remainingCount = remainingCount;
        this.available = available;
        this.message = message;
    }

    public int getDailyLimit() {
        return dailyLimit;
    }

    public void setDailyLimit(int dailyLimit) {
        this.dailyLimit = dailyLimit;
    }

    public int getUsedCount() {
        return usedCount;
    }

    public void setUsedCount(int usedCount) {
        this.usedCount = usedCount;
    }

    public int getRemainingCount() {
        return remainingCount;
    }

    public void setRemainingCount(int remainingCount) {
        this.remainingCount = remainingCount;
    }

    public boolean isAvailable() {
        return available;
    }

    public void setAvailable(boolean available) {
        this.available = available;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}