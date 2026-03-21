package com.tripflow.dto.itinerary.share;

import java.time.LocalDateTime;

public class ShareLinkDTO {
    private final Long id;
    private final String token;
    private final LocalDateTime createdAt;
    private final LocalDateTime expiresAt;
    private final boolean active;

    public ShareLinkDTO(
        Long id,
        String token,
        LocalDateTime createdAt,
        LocalDateTime expiresAt,
        boolean active
    ) {
        this.id = id;
        this.token = token;
        this.createdAt = createdAt;
        this.expiresAt = expiresAt;
        this.active = active;
    }

    public Long getId() {
        return id;
    }

    public String getToken() {
        return token;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public boolean isActive() {
        return active;
    }
}
