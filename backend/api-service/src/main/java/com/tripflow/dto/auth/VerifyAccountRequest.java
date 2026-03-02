package com.tripflow.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record VerifyAccountRequest(
    @NotBlank(message = "Username is required")
    String username,

    @NotBlank(message = "Verification code is required")
    @Size(max = 10, message = "Verification code must not exceed 10 characters")
    String code
) {}
