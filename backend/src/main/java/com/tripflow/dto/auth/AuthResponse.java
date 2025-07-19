package com.tripflow.dto.auth;

import java.util.Map;

import com.tripflow.dto.user.PublicUserDTO;

public record AuthResponse(
    AuthStatus status,
    String message,
    Map<String, String> errors,
    PublicUserDTO user
) {}