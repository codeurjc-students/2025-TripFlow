package com.tripflow.dto.user;

public record RegisterUserRequest(
    String username,
    String password,
    String confirmPassword
) {}