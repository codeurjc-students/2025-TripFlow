package com.tripflow.repository.itinerary;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.tripflow.model.itinerary.Itinerary;
import com.tripflow.model.itinerary.ItineraryShareLink;

@Repository
public interface ItineraryShareLinkRepository extends JpaRepository<ItineraryShareLink, Long> {

    Optional<ItineraryShareLink> findByToken(String token);

    Optional<ItineraryShareLink> findByIdAndItinerary(Long id, Itinerary itinerary);

    List<ItineraryShareLink> findByItineraryAndRevokedAtIsNullAndExpiresAtAfterOrderByCreatedAtDesc(
        Itinerary itinerary,
        LocalDateTime now
    );
}
