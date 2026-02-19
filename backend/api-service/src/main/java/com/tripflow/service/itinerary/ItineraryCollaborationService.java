package com.tripflow.service.itinerary;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.tripflow.dto.itinerary.collaborator.AddCollaboratorRequest;
import com.tripflow.dto.itinerary.collaborator.CollaboratorDTO;
import com.tripflow.dto.itinerary.collaborator.RemoveCollaboratorRequest;
import com.tripflow.dto.itinerary.collaborator.UpdateCollaboratorRequest;
import com.tripflow.mappers.CollaboratorMapper;
import com.tripflow.model.User;
import com.tripflow.model.itinerary.Itinerary;
import com.tripflow.model.itinerary.ItineraryCollaborator;
import com.tripflow.model.types.CollaboratorRole;
import com.tripflow.repository.itinerary.ItineraryCollaboratorRepository;
import com.tripflow.repository.itinerary.ItineraryRepository;
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

    public ItineraryCollaborationService(
        ItineraryRepository itineraryRepository,
        ItineraryCollaboratorRepository itineraryCollaboratorRepository,
        UserService userService,
        ItineraryPermissionService itineraryPermissionService,
        CollaboratorMapper collaboratorMapper
    ) {
        this.itineraryRepository = itineraryRepository;
        this.itineraryCollaboratorRepository = itineraryCollaboratorRepository;
        this.userService = userService;
        this.itineraryPermissionService = itineraryPermissionService;
        this.collaboratorMapper = collaboratorMapper;
    }

    /**
     * Retrieves the collaborators of an itinerary.
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

        return this.collaboratorMapper.toDTOs(this.itineraryCollaboratorRepository.findByItinerary(itinerary));
    }

    /**
     * Adds a collaborator to an itinerary.
     *
     * @param request the request containing the itinerary ID and collaborator details
     * @return the added collaborator
     */
    public CollaboratorDTO addCollaborator(Long itineraryId, AddCollaboratorRequest request) {
        Itinerary itinerary = this.getItineraryOrThrow(itineraryId);
        User authenticatedUser = this.userService.getAuthenticatedUser();

        if (!this.itineraryPermissionService.canManageCollaborators(itinerary, authenticatedUser)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the owner can manage collaborators");
        }

        User userToAdd;
        try {
            userToAdd = this.userService.getUserByUsername(request.username());
        } catch (UsernameNotFoundException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
        }
        
        if (itinerary.getUser().equals(userToAdd)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Owner cannot be a collaborator");
        }

        if (this.itineraryCollaboratorRepository.existsByItineraryAndUser(itinerary, userToAdd)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "User is already a collaborator");
        }

        ItineraryCollaborator collaborator = new ItineraryCollaborator(
            CollaboratorRole.valueOf(request.role().name()),
            userToAdd,
            itinerary
        );

        return this.collaboratorMapper.toDTO(this.itineraryCollaboratorRepository.save(collaborator));
    }

    /**
     * Updates the role of a collaborator.
     *
     * @param request the request containing the itinerary ID and collaborator details
     * @return the updated collaborator
     */
    public CollaboratorDTO updateCollaboratorRole(Long itineraryId, UpdateCollaboratorRequest request) {
        Itinerary itinerary = this.getItineraryOrThrow(itineraryId);
        User authenticatedUser = this.userService.getAuthenticatedUser();

        if (!this.itineraryPermissionService.canManageCollaborators(itinerary, authenticatedUser)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the owner can manage collaborators");
        }

        User collaboratorUser;
        try {
            collaboratorUser = this.userService.getUserByUsername(request.username());
        } catch (UsernameNotFoundException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
        }
        
        ItineraryCollaborator collaborator = itineraryCollaboratorRepository.findByItineraryAndUser(itinerary, collaboratorUser)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Collaborator not found"));

        collaborator.setRole(CollaboratorRole.valueOf(request.role().name()));
        return this.collaboratorMapper.toDTO(this.itineraryCollaboratorRepository.save(collaborator));
    }

    /**
     * Removes a collaborator from an itinerary.
     *
     * @param request the request containing the itinerary ID and collaborator details
     */
    public void removeCollaborator(Long itineraryId, RemoveCollaboratorRequest request) {
        Itinerary itinerary = this.getItineraryOrThrow(itineraryId);
        User authenticatedUser = this.userService.getAuthenticatedUser();

        User userToRemove;
        try {
            userToRemove = this.userService.getUserByUsername(request.username());
        } catch (UsernameNotFoundException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
        }

        boolean isOwner = this.itineraryPermissionService.isOwner(itinerary, authenticatedUser);
        boolean isSelfRemoval = authenticatedUser.equals(userToRemove);

        if (!isOwner && !isSelfRemoval) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have permission to remove this collaborator");
        }
        
        ItineraryCollaborator collaborator = this.itineraryCollaboratorRepository.findByItineraryAndUser(itinerary, userToRemove)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Collaborator not found"));

        this.itineraryCollaboratorRepository.delete(collaborator);
    }

    private Itinerary getItineraryOrThrow(Long id) {
        return itineraryRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Itinerary not found"));
    }
}
