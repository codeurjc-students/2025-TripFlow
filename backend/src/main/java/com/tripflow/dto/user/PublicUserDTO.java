package com.tripflow.dto.user;

import java.time.LocalDateTime;

import com.tripflow.model.types.UserType;

public record PublicUserDTO(
    Long id,
    String username,
    String name,
    String description,
    String location,
    LocalDateTime createdAt,
    UserType role
) {}