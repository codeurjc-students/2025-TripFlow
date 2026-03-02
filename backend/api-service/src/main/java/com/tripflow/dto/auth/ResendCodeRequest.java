package com.tripflow.dto.auth;

import jakarta.validation.constraints.NotBlank;

public record ResendCodeRequest(
    @NotBlank(message = "Username is required")
    String username
) {}
