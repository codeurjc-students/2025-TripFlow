package com.tripflow.dto.user;

import java.time.LocalDateTime;

public record PublicUserDTO(
    String username,
    String name,
    String description,
    String location,
    Boolean notificationsAllowed,
    LocalDateTime createdAt,
    UserTypeDTO role,
    PlanTypeDTO plan
) {}