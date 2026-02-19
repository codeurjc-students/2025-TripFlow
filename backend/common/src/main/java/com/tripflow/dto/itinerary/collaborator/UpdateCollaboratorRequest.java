package com.tripflow.dto.itinerary.collaborator;

public record UpdateCollaboratorRequest(
    String username,
    CollaboratorRoleDTO role
) {}