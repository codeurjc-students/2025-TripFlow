package com.tripflow.dto.itinerary.collaborator;

public record AddCollaboratorRequest(
    String username,
    CollaboratorRoleDTO role
) {}
