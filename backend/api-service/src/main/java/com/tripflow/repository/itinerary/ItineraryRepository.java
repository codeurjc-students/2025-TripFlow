package com.tripflow.repository.itinerary;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.tripflow.model.User;
import com.tripflow.model.itinerary.Itinerary;


@Repository
public interface ItineraryRepository extends JpaRepository<Itinerary, Long> {
    @Query("SELECT DISTINCT i FROM Itinerary i " +
           "LEFT JOIN i.collaborators c " +
           "WHERE i.user = :user OR (c.user = :user AND c.status = 'ACCEPTED') " +
           "ORDER BY i.updatedAt DESC")
    Page<Itinerary> findAllByUserOrCollaboratorOrderByUpdatedAtDesc(
        @Param("user") User user,
        Pageable pageable
    );

    @Query("SELECT DISTINCT i FROM Itinerary i " +
           "LEFT JOIN i.collaborators c " +
           "WHERE (i.user = :user OR (c.user = :user AND c.status = 'ACCEPTED')) AND " +
           "(LOWER(i.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(i.place) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(CAST(function('array_to_string', i.tags, ',') AS string)) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY i.updatedAt DESC")
    Page<Itinerary> findAllByUserOrCollaboratorAndSearchOrderByUpdatedAtDesc(
        @Param("user") User user,
        @Param("search") String search,
        Pageable pageable
    );

    Page<Itinerary> findAllByUserOrderByUpdatedAtDesc(User user, Pageable pageable);

    @Query("SELECT DISTINCT i FROM Itinerary i WHERE i.user = :user AND " +
           "(LOWER(i.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(i.place) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(CAST(function('array_to_string', i.tags, ',') AS string)) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY i.updatedAt DESC")
    Page<Itinerary> findAllByUserAndSearchOrderByUpdatedAtDesc(
        @Param("user") User user,
        @Param("search") String search,
        Pageable pageable
    );

    Long countByUser(User user);


    @Query("SELECT COUNT(id) FROM ItineraryDay id JOIN id.itinerary i WHERE i.user.id = :userId")
    Long countTotalDaysByUserId(@Param("userId") Long userId);
    
    @Query("SELECT COUNT(DISTINCT i.place) FROM Itinerary i WHERE i.user.id = :userId")
    Long countDistinctLocationsByUserId(@Param("userId") Long userId);
}