package com.tripflow.model.itinerary;

import java.time.LocalDateTime;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import com.tripflow.model.User;
import com.tripflow.model.types.CollaboratorRole;
import com.tripflow.model.types.InvitationStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(uniqueConstraints = @UniqueConstraint(columnNames = {"itinerary_id", "user_id"}))
@EntityListeners(AuditingEntityListener.class)
public class ItineraryCollaborator {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CollaboratorRole role;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InvitationStatus status = InvitationStatus.PENDING;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "itinerary_id", nullable = false)
    private Itinerary itinerary;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime invitedAt;

    @Column
    private LocalDateTime acceptedAt;

    // [Constructors] =================================================

    public ItineraryCollaborator() {
    }

    public ItineraryCollaborator(CollaboratorRole role, User user, Itinerary itinerary) {
        this.role = role;
        this.user = user;
        this.itinerary = itinerary;
        this.status = InvitationStatus.PENDING;
    }

    // [Getters and Setters] ==========================================

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public CollaboratorRole getRole() {
        return role;
    }

    public void setRole(CollaboratorRole role) {
        this.role = role;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Itinerary getItinerary() {
        return itinerary;
    }

    public void setItinerary(Itinerary itinerary) {
        this.itinerary = itinerary;
    }

    public LocalDateTime getInvitedAt() {
        return invitedAt;
    }

    public void setInvitedAt(LocalDateTime invitedAt) {
        this.invitedAt = invitedAt;
    }

    public LocalDateTime getAcceptedAt() {
        return acceptedAt;
    }

    public void setAcceptedAt(LocalDateTime acceptedAt) {
        this.acceptedAt = acceptedAt;
    }

    public InvitationStatus getStatus() {
        return status;
    }

    public void setStatus(InvitationStatus status) {
        this.status = status;
    }
}
