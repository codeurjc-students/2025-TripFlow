package com.tripflow.service.itinerary;

import java.util.Optional;

import org.springframework.stereotype.Service;

import com.tripflow.model.User;
import com.tripflow.model.itinerary.Itinerary;
import com.tripflow.model.itinerary.ItineraryCollaborator;
import com.tripflow.model.types.CollaboratorRole;
import com.tripflow.model.types.InvitationStatus;
import com.tripflow.repository.itinerary.ItineraryCollaboratorRepository;

@Service
public class ItineraryPermissionService {
    
    private final ItineraryCollaboratorRepository itineraryCollaboratorRepository;

    public ItineraryPermissionService(ItineraryCollaboratorRepository itineraryCollaboratorRepository) {
        this.itineraryCollaboratorRepository = itineraryCollaboratorRepository;
    }

    /**
     * Checks if the user has permission to view the itinerary.
     * 
     * @param itinerary The itinerary to check.
     * @param user The user to check.
     * @return true if the user has permission to view the itinerary, false otherwise.
     */
    public boolean canView(Itinerary itinerary, User user) {
        if (isOwner(itinerary, user)) {
            return true;
        }

        return itineraryCollaboratorRepository.existsByItineraryAndUserAndStatus(itinerary, user, InvitationStatus.ACCEPTED);
    }

    /**
     * Checks if the user has permission to edit the itinerary.
     * 
     * @param itinerary The itinerary to check.
     * @param user The user to check.
     * @return true if the user has permission to edit the itinerary, false otherwise.
     */
    public boolean canEdit(Itinerary itinerary, User user) {
        if (isOwner(itinerary, user)) {
            return true;
        }

        Optional<ItineraryCollaborator> collaborator = itineraryCollaboratorRepository.findByItineraryAndUser(itinerary, user);
        return collaborator.map(c -> c.getStatus() == InvitationStatus.ACCEPTED && c.getRole() == CollaboratorRole.EDITOR).orElse(false);
    }

    /**
     * Checks if the user has permission to delete the itinerary.
     * 
     * @param itinerary The itinerary to check.
     * @param user The user to check.
     * @return true if the user has permission to delete the itinerary, false otherwise.
     */
    public boolean canDelete(Itinerary itinerary, User user) {
        return isOwner(itinerary, user);
    }

    /**
     * Checks if the user has permission to manage collaborators of the itinerary.
     * 
     * @param itinerary The itinerary to check.
     * @param user The user to check.
     * @return true if the user has permission to manage collaborators of the itinerary, false otherwise.
     */
    public boolean canManageCollaborators(Itinerary itinerary, User user) {
        return isOwner(itinerary, user);
    }

    /**
     * Checks if the user is the owner of the itinerary.
     * 
     * @param itinerary The itinerary to check.
     * @param user The user to check.
     * @return true if the user is the owner of the itinerary, false otherwise.
     */
    public boolean isOwner(Itinerary itinerary, User user) {
        return itinerary.getUser().equals(user);
    }
}
