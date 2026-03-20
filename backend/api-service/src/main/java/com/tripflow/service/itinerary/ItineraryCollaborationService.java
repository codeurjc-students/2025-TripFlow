package com.tripflow.service.itinerary;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.tripflow.dto.itinerary.collaborator.AddCollaboratorRequest;
import com.tripflow.dto.itinerary.collaborator.CollaboratorDTO;
import com.tripflow.dto.itinerary.collaborator.CollaboratorRoleDTO;
import com.tripflow.dto.itinerary.collaborator.UpdateCollaboratorRequest;
import com.tripflow.mappers.CollaboratorMapper;
import com.tripflow.model.User;
import com.tripflow.model.itinerary.Itinerary;
import com.tripflow.model.itinerary.ItineraryCollaborator;
import com.tripflow.model.types.CollaboratorRole;
import com.tripflow.model.types.InvitationStatus;
import com.tripflow.repository.itinerary.ItineraryCollaboratorRepository;
import com.tripflow.repository.itinerary.ItineraryRepository;
import com.tripflow.dto.notification.NotificationTypeDTO;
import com.tripflow.kafka.messages.CollaborationEventMessage;
import com.tripflow.kafka.messages.CollaborationEventType;
import com.tripflow.kafka.messages.NotificationMessage;
import com.tripflow.service.KafkaService;
import com.tripflow.service.UserService;

import jakarta.transaction.Transactional;

@Service
@Transactional
public class ItineraryCollaborationService {
    private final ItineraryRepository itineraryRepository;
    private final ItineraryCollaboratorRepository itineraryCollaboratorRepository;
    private final UserService userService;
    private final ItineraryPermissionService itineraryPermissionService;
    private final CollaboratorMapper collaboratorMapper;
    private final KafkaService kafkaService;

    public ItineraryCollaborationService(
        ItineraryRepository itineraryRepository,
        ItineraryCollaboratorRepository itineraryCollaboratorRepository,
        UserService userService,
        ItineraryPermissionService itineraryPermissionService,
        CollaboratorMapper collaboratorMapper,
        KafkaService kafkaService
    ) {
        this.itineraryRepository = itineraryRepository;
        this.itineraryCollaboratorRepository = itineraryCollaboratorRepository;
        this.userService = userService;
        this.itineraryPermissionService = itineraryPermissionService;
        this.collaboratorMapper = collaboratorMapper;
        this.kafkaService = kafkaService;
    }

    /**
     * Retrieves the pending invitations for a user.
     *
     * @param username the username of the user
     * @return a list of pending invitations
     */
    public List<CollaboratorDTO> getPendingInvitations(String username) {
        User user = this.getUserOrThrow(username);

        User authenticatedUser = this.userService.getAuthenticatedUser();
        if (!authenticatedUser.equals(user)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only view your own invitations");
        }

        return this.collaboratorMapper.toDTOs(
            this.itineraryCollaboratorRepository.findByUserAndStatus(user, InvitationStatus.PENDING)
        );
    }

    /**
     * Retrieves all collaborators of an itinerary (both pending and accepted).
     *
     * @param itineraryId the ID of the itinerary
     * @return a list of collaborators
     */
    public List<CollaboratorDTO> getCollaborators(Long itineraryId) {
        Itinerary itinerary = this.getItineraryOrThrow(itineraryId);
        User authenticatedUser = this.userService.getAuthenticatedUser();

        if (!this.itineraryPermissionService.canView(itinerary, authenticatedUser)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have permission to view this itinerary's collaborators");
        }

        return this.collaboratorMapper.toDTOs(
            this.itineraryCollaboratorRepository.findByItinerary(itinerary)
        );
    }

    /**
     * Sends an invitation to a user to collaborate on an itinerary.
     * Creates a collaborator record with PENDING status.
     *
     * @param itineraryId the ID of the itinerary
     * @param request the request containing the username and role
     * @return the created invitation (collaborator with PENDING status)
     */
    public CollaboratorDTO sendInvitation(Long itineraryId, AddCollaboratorRequest request) {
        Itinerary itinerary = this.getItineraryOrThrow(itineraryId);
        User authenticatedUser = this.userService.getAuthenticatedUser();

        if (!this.itineraryPermissionService.canManageCollaborators(itinerary, authenticatedUser)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the owner can manage collaborators");
        }

        if (request.role() == CollaboratorRoleDTO.OWNER) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot assign OWNER role to collaborators");
        }

        User userToInvite = this.getUserOrThrow(request.username());
        
        if (itinerary.getUser().equals(userToInvite)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Owner cannot be a collaborator");
        }

        if (this.itineraryCollaboratorRepository.existsByItineraryAndUser(itinerary, userToInvite)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "User already has a pending invitation or is already a collaborator");
        }

        ItineraryCollaborator collaborator = new ItineraryCollaborator(
            CollaboratorRole.valueOf(request.role().name()),
            userToInvite,
            itinerary
        );

        CollaboratorDTO result = this.collaboratorMapper.toDTO(this.itineraryCollaboratorRepository.save(collaborator));
        
        this.kafkaService.sendNotificationMessage(new NotificationMessage(
            userToInvite.getUsername(),
            "You have been invited to collaborate on the itinerary: " + itinerary.getTitle(),
            NotificationTypeDTO.INVITATION_RECEIVED
        ));

        this.kafkaService.sendCollaborationEventMessage(new CollaborationEventMessage(
            itineraryId,
            CollaborationEventType.INVITE_SENT,
            authenticatedUser.getUsername(),
            userToInvite.getUsername(),
            request.role().name()
        ));

        return result;
    }

    /**
     * Accepts a pending invitation to collaborate on an itinerary.
     *
     * @param itineraryId the ID of the itinerary
     * @param username the username of the invited user
     * @return the accepted collaborator
     */
    public CollaboratorDTO acceptInvitation(Long itineraryId, String username) {
        Itinerary itinerary = this.getItineraryOrThrow(itineraryId);
        User user = this.getUserOrThrow(username);

        User authenticatedUser = this.userService.getAuthenticatedUser();
        if (!authenticatedUser.equals(user)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only accept your own invitations");
        }

        ItineraryCollaborator collaborator = this.itineraryCollaboratorRepository
            .findByItineraryAndUser(itinerary, user)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Invitation not found"));

        if (collaborator.getStatus() != InvitationStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invitation is not pending");
        }

        collaborator.setStatus(InvitationStatus.ACCEPTED);
        collaborator.setAcceptedAt(LocalDateTime.now());
        CollaboratorDTO result = this.collaboratorMapper.toDTO(this.itineraryCollaboratorRepository.save(collaborator));

        this.kafkaService.sendNotificationMessage(new NotificationMessage(
            itinerary.getUser().getUsername(),
            user.getUsername() + " has accepted your invitation to collaborate on: " + itinerary.getTitle(),
            NotificationTypeDTO.INVITATION_ACCEPTED
        ));

        this.kafkaService.sendCollaborationEventMessage(new CollaborationEventMessage(
            itineraryId,
            CollaborationEventType.INVITE_ACCEPTED,
            user.getUsername(),
            user.getUsername(),
            collaborator.getRole().name()
        ));

        return result;
    }

    /**
     * Declines a pending invitation.
     *
     * @param itineraryId the ID of the itinerary
     * @param username the username of the invited user
     */
    public void declineInvitation(Long itineraryId, String username) {
        Itinerary itinerary = this.getItineraryOrThrow(itineraryId);
        User user = this.getUserOrThrow(username);

        User authenticatedUser = this.userService.getAuthenticatedUser();
        if (!authenticatedUser.equals(user)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only decline your own invitations");
        }

        ItineraryCollaborator collaborator = this.itineraryCollaboratorRepository
            .findByItineraryAndUser(itinerary, user)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Invitation not found"));

        if (collaborator.getStatus() != InvitationStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invitation is already accepted or invalid");
        }

        this.itineraryCollaboratorRepository.delete(collaborator);

        this.kafkaService.sendCollaborationEventMessage(new CollaborationEventMessage(
            itineraryId,
            CollaborationEventType.INVITE_DECLINED,
            user.getUsername(),
            user.getUsername(),
            collaborator.getRole().name()
        ));
    }

    /**
     * Updates the role of a collaborator.
     *
     * @param itineraryId the ID of the itinerary
     * @param username the username of the collaborator
     * @param request the request containing the new role
     * @return the updated collaborator
     */
    public CollaboratorDTO updateCollaboratorRole(
        Long itineraryId, String username, UpdateCollaboratorRequest request
    ) {
        Itinerary itinerary = this.getItineraryOrThrow(itineraryId);
        User authenticatedUser = this.userService.getAuthenticatedUser();

        if (!this.itineraryPermissionService.canManageCollaborators(itinerary, authenticatedUser)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the owner can manage collaborators");
        }

        if (request.role() == CollaboratorRoleDTO.OWNER) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot assign OWNER role to collaborators");
        }

        User collaboratorUser = this.getUserOrThrow(username);
        
        ItineraryCollaborator collaborator = itineraryCollaboratorRepository.findByItineraryAndUser(itinerary, collaboratorUser)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Collaborator not found"));

        if (collaborator.getStatus() != InvitationStatus.ACCEPTED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Can only update the role of accepted collaborators");
        }

        collaborator.setRole(CollaboratorRole.valueOf(request.role().name()));
        CollaboratorDTO result = this.collaboratorMapper.toDTO(this.itineraryCollaboratorRepository.save(collaborator));

        this.kafkaService.sendCollaborationEventMessage(new CollaborationEventMessage(
            itineraryId,
            CollaborationEventType.ROLE_UPDATED,
            authenticatedUser.getUsername(),
            collaboratorUser.getUsername(),
            request.role().name()
        ));

        return result;
    }

    /**
     * Removes a collaborator from an itinerary.
     *
     * @param itineraryId the ID of the itinerary
     * @param username the username of the collaborator to remove
     */
    public void removeCollaborator(Long itineraryId, String username) {
        Itinerary itinerary = this.getItineraryOrThrow(itineraryId);
        User authenticatedUser = this.userService.getAuthenticatedUser();
        User userToRemove = this.getUserOrThrow(username);

        boolean isOwner = this.itineraryPermissionService.isOwner(itinerary, authenticatedUser);
        boolean isSelfRemoval = authenticatedUser.equals(userToRemove);

        if (!isOwner && !isSelfRemoval) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have permission to remove this collaborator");
        }
        
        ItineraryCollaborator collaborator = this.itineraryCollaboratorRepository.findByItineraryAndUser(itinerary, userToRemove)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Collaborator not found"));

        this.itineraryCollaboratorRepository.delete(collaborator);

        this.kafkaService.sendCollaborationEventMessage(new CollaborationEventMessage(
            itineraryId,
            CollaborationEventType.COLLABORATOR_REMOVED,
            authenticatedUser.getUsername(),
            userToRemove.getUsername(),
            collaborator.getRole().name()
        ));
    }

    private Itinerary getItineraryOrThrow(Long id) {
        return itineraryRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Itinerary not found"));
    }

    private User getUserOrThrow(String username) {
        try {
            return this.userService.getUserByUsername(username);
        } catch (UsernameNotFoundException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
        }
    }
}
