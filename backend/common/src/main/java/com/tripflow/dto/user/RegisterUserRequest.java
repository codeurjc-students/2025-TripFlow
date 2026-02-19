package com.tripflow.dto.user;

public record RegisterUserRequest(
    String email,
    String username,
    String password,
    String confirmPassword
) {}