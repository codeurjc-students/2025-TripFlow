package com.tripflow.dto.auth;

import jakarta.validation.constraints.NotBlank;

public record ResetPasswordOtpRequest(
    @NotBlank(message = "Username or email is required")
    String username,

    @NotBlank(message = "Verification code is required")
    String code,

    @NotBlank(message = "Password is required")
    String password,

    @NotBlank(message = "Confirm password is required")
    String confirmPassword
) {}
