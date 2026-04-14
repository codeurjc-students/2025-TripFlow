package com.tripflow.dto.user;

import jakarta.validation.constraints.Size;

public record UpdateUserRequest(
    @Size(max = 50, message = "Name must not exceed 50 characters")
    String name,

    @Size(max = 500, message = "Description must not exceed 500 characters")
    String description,

    @Size(max = 100, message = "Location must not exceed 100 characters")
    String location,

    Boolean notificationsAllowed
) {}