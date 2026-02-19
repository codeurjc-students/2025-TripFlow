package com.tripflow.unit;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import com.tripflow.model.User;
import com.tripflow.model.itinerary.Itinerary;
import com.tripflow.model.itinerary.ItineraryCollaborator;
import com.tripflow.model.types.CollaboratorRole;
import com.tripflow.repository.itinerary.ItineraryCollaboratorRepository;
import com.tripflow.service.itinerary.ItineraryPermissionService;

@Tag("unit")
public class ItineraryPermissionServiceTest {

    @Mock
    private ItineraryCollaboratorRepository itineraryCollaboratorRepository;

    private ItineraryPermissionService itineraryPermissionService;

    private User owner;
    private User collaborator;
    private User otherUser;
    private Itinerary itinerary;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
        this.itineraryPermissionService = new ItineraryPermissionService(itineraryCollaboratorRepository);

        this.owner = new User();
        this.owner.setId(1L);
        this.owner.setUsername("owner");

        this.collaborator = new User();
        this.collaborator.setId(2L);
        this.collaborator.setUsername("collaborator");

        this.otherUser = new User();
        this.otherUser.setId(3L);
        this.otherUser.setUsername("other");

        this.itinerary = new Itinerary();
        this.itinerary.setId(1L);
        this.itinerary.setUser(this.owner);
    }

    @Test
    @DisplayName("Test canView - Owner should have access")
    public void testCanViewOwner() {
        assertTrue(this.itineraryPermissionService.canView(itinerary, owner));
    }

    @Test
    @DisplayName("Test canView - Collaborator should have access")
    public void testCanViewCollaborator() {
        when(itineraryCollaboratorRepository.existsByItineraryAndUser(itinerary, collaborator)).thenReturn(true);
        assertTrue(this.itineraryPermissionService.canView(itinerary, collaborator));
    }

    @Test
    @DisplayName("Test canView - Other user should NOT have access")
    public void testCanViewOther() {
        when(itineraryCollaboratorRepository.existsByItineraryAndUser(itinerary, otherUser)).thenReturn(false);
        assertFalse(this.itineraryPermissionService.canView(itinerary, otherUser));
    }

    @Test
    @DisplayName("Test canEdit - Owner should have access")
    public void testCanEditOwner() {
        assertTrue(this.itineraryPermissionService.canEdit(itinerary, owner));
    }

    @Test
    @DisplayName("Test canEdit - Editor should have access")
    public void testCanEditEditor() {
        ItineraryCollaborator editorCollaborator = new ItineraryCollaborator(CollaboratorRole.EDITOR, collaborator, itinerary);
        when(itineraryCollaboratorRepository.findByItineraryAndUser(itinerary, collaborator))
            .thenReturn(Optional.of(editorCollaborator));

        assertTrue(this.itineraryPermissionService.canEdit(itinerary, collaborator));
    }

    @Test
    @DisplayName("Test canEdit - Viewer should NOT have access")
    public void testCanEditViewer() {
        ItineraryCollaborator viewerCollaborator = new ItineraryCollaborator(CollaboratorRole.VIEWER, collaborator, itinerary);
        when(itineraryCollaboratorRepository.findByItineraryAndUser(itinerary, collaborator))
            .thenReturn(Optional.of(viewerCollaborator));

        assertFalse(this.itineraryPermissionService.canEdit(itinerary, collaborator));
    }

    @Test
    @DisplayName("Test canDelete - Owner should have access")
    public void testCanDeleteOwner() {
        assertTrue(this.itineraryPermissionService.canDelete(itinerary, owner));
    }

    @Test
    @DisplayName("Test canDelete - Collaborator should NOT have access")
    public void testCanDeleteCollaborator() {
        assertFalse(this.itineraryPermissionService.canDelete(itinerary, collaborator));
    }

    @Test
    @DisplayName("Test canManageCollaborators - Owner should have access")
    public void testCanManageCollaboratorsOwner() {
        assertTrue(this.itineraryPermissionService.canManageCollaborators(itinerary, owner));
    }

    @Test
    @DisplayName("Test canManageCollaborators - Collaborator should NOT have access")
    public void testCanManageCollaboratorsCollaborator() {
        assertFalse(this.itineraryPermissionService.canManageCollaborators(itinerary, collaborator));
    }
}
