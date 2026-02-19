package com.tripflow.model.itinerary;

import java.sql.Timestamp;
import java.util.List;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import com.tripflow.model.ExternalImage;
import com.tripflow.model.User;
import com.tripflow.model.types.ItineraryStatus;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;

@Entity
@EntityListeners(AuditingEntityListener.class)
public class Itinerary {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    private String place;

    private int people = 1;

    private double budget = 0.0;

    private String date;

    private List<String> tags = List.of();

    private long updatedCount = 0;

    @Enumerated(EnumType.STRING)
    private ItineraryStatus status = ItineraryStatus.DRAFT;

    @ManyToOne
    private User user;

    @ManyToOne
    private ExternalImage coverImage = null;

    @OneToMany(mappedBy = "itinerary", cascade = CascadeType.ALL)
    private List<ItineraryDay> days;

    @OneToMany(mappedBy = "itinerary", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ItineraryCollaborator> collaborators;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private Timestamp createdAt;

    @LastModifiedDate
    @Column(nullable = false)
    private Timestamp updatedAt;

    // [Methods] ======================================================

    /**
     * Adds a day to the itinerary.
     * 
     * @param day the itinerary day to add
     */
    public void addDay(ItineraryDay day) {
        if (day != null) {
            if (this.days == null) this.days = new java.util.ArrayList<>();
            this.days.add(day);
        }
    }

    // [Getters and Setters] ==========================================

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getPlace() {
        return place;
    }

    public void setPlace(String place) {
        this.place = place;
    }

    public int getPeople() {
        return people;
    }

    public void setPeople(int people) {
        this.people = people;
    }

    public double getBudget() {
        return budget;
    }

    public void setBudget(double budget) {
        this.budget = budget;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public List<String> getTags() {
        return tags;
    }

    public void setTags(List<String> tags) {
        this.tags = tags;
    }

    public long getUpdatedCount() {
        return updatedCount;
    }

    public void setUpdatedCount(long updatedCount) {
        this.updatedCount = updatedCount;
    }

    public ItineraryStatus getStatus() {
        return status;
    }

    public void setStatus(ItineraryStatus status) {
        this.status = status;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public ExternalImage getCoverImage() {
        return coverImage;
    }

    public void setCoverImage(ExternalImage coverImage) {
        this.coverImage = coverImage;
    }

    public List<ItineraryDay> getDays() {
        return days;
    }

    public void setDays(List<ItineraryDay> days) {
        this.days = days;
    }

    public List<ItineraryCollaborator> getCollaborators() {
        return collaborators;
    }

    public void setCollaborators(List<ItineraryCollaborator> collaborators) {
        this.collaborators = collaborators;
    }

    public Timestamp getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
    }

    public Timestamp getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Timestamp updatedAt) {
        this.updatedAt = updatedAt;
    }
}
