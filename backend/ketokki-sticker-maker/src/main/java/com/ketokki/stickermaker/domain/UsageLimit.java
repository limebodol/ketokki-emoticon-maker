package com.ketokki.stickermaker.domain;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "usage_limit",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_usage_limit_ip_action_date",
                        columnNames = {"client_ip", "action_type", "used_date"}
                )
        }
)
public class UsageLimit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "client_ip", nullable = false, length = 100)
    private String clientIp;

    @Column(name = "action_type", nullable = false, length = 50)
    private String actionType;

    @Column(name = "used_date", nullable = false)
    private LocalDate usedDate;

    @Column(name = "usage_count", nullable = false)
    private int usageCount;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    protected UsageLimit() {
    }

    public UsageLimit(String clientIp, String actionType, LocalDate usedDate) {
        this.clientIp = clientIp;
        this.actionType = actionType;
        this.usedDate = usedDate;
        this.usageCount = 0;
    }

    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public void increaseCount() {
        this.usageCount += 1;
    }

    public Long getId() {
        return id;
    }

    public String getClientIp() {
        return clientIp;
    }

    public String getActionType() {
        return actionType;
    }

    public LocalDate getUsedDate() {
        return usedDate;
    }

    public int getUsageCount() {
        return usageCount;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}