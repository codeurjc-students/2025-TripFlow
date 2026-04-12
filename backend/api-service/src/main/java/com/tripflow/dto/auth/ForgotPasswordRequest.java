package com.tripflow.dto.auth;

import jakarta.validation.constraints.NotBlank;

public record ForgotPasswordRequest(
    @NotBlank(message = "Username or email is required")
    String username
) {}
