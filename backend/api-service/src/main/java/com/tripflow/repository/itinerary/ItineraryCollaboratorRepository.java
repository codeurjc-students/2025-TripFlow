package com.tripflow.repository.itinerary;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.tripflow.model.User;
import com.tripflow.model.itinerary.Itinerary;
import com.tripflow.model.itinerary.ItineraryCollaborator;
import com.tripflow.model.types.InvitationStatus;

@Repository
public interface ItineraryCollaboratorRepository extends JpaRepository<ItineraryCollaborator, Long> {
    
    List<ItineraryCollaborator> findByItinerary(Itinerary itinerary);

    List<ItineraryCollaborator> findByItineraryAndStatus(Itinerary itinerary, InvitationStatus status);

    Optional<ItineraryCollaborator> findByItineraryAndUser(Itinerary itinerary, User user);

    boolean existsByItineraryAndUser(Itinerary itinerary, User user);

    boolean existsByItineraryAndUserAndStatus(Itinerary itinerary, User user, InvitationStatus status);

    void deleteByItineraryAndUser(Itinerary itinerary, User user);

    List<ItineraryCollaborator> findByUserAndStatus(User user, InvitationStatus status);
}
