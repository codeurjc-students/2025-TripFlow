package com.tripflow.dto.auth;

public record LoginRequest(
    String username,
    String password
) {}