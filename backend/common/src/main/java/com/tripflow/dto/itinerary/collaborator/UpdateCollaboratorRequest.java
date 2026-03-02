package com.tripflow.dto.itinerary.collaborator;

import jakarta.validation.constraints.NotNull;

public record UpdateCollaboratorRequest(
    @NotNull(message = "Role is required")
    CollaboratorRoleDTO role
) {}