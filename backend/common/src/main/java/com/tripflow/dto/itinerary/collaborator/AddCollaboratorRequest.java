package com.tripflow.dto.itinerary.collaborator;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AddCollaboratorRequest(
    @NotBlank(message = "Username is required")
    String username,

    @NotNull(message = "Role is required")
    CollaboratorRoleDTO role
) {}
