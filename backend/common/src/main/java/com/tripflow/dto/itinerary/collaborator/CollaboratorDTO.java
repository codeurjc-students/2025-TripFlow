package com.tripflow.dto.itinerary.collaborator;

import java.time.LocalDateTime;

import com.tripflow.dto.user.PublicUserDTO;

public record CollaboratorDTO(
    Long id,
    PublicUserDTO user,
    CollaboratorRoleDTO role,
    InvitationStatusDTO status,
    LocalDateTime invitedAt,
    LocalDateTime acceptedAt,
    Long itineraryId,
    String itineraryTitle
) {}
