package com.tripflow.security.jwt;

import java.time.Duration;

public enum TokenType {
    AUTH_TOKEN(Duration.ofMinutes(15), "auth_token"),
    REFRESH_TOKEN(Duration.ofDays(30), "refresh_token");

    private final Duration duration;
    private final String cookieName;

    TokenType(Duration duration, String cookieName) {
        this.duration = duration;
        this.cookieName = cookieName;
    }

    public Duration getDuration() {
        return duration;
    }

    public String getCookieName() {
        return cookieName;
    }
}