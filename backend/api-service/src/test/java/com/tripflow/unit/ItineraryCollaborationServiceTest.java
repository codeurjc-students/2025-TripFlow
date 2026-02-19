package com.tripflow.unit;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.util.Optional;
import java.time.LocalDateTime;

import com.tripflow.dto.user.PublicUserDTO;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
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
import com.tripflow.dto.itinerary.collaborator.CollaboratorRoleDTO;
import com.tripflow.repository.itinerary.ItineraryCollaboratorRepository;
import com.tripflow.repository.itinerary.ItineraryRepository;
import com.tripflow.service.UserService;
import com.tripflow.service.itinerary.ItineraryCollaborationService;
import com.tripflow.service.itinerary.ItineraryPermissionService;

@Tag("unit")
public class ItineraryCollaborationServiceTest {

    private ItineraryRepository itineraryRepository;
    private ItineraryCollaboratorRepository itineraryCollaboratorRepository;
    private UserService userService;
    private ItineraryPermissionService itineraryPermissionService;
    private CollaboratorMapper collaboratorMapper;

    private ItineraryCollaborationService collaborationService;

    private User owner;
    private User collaborator;
    private User otherUser;
    private Itinerary itinerary;

    @BeforeEach
    public void setUp() {
        this.itineraryRepository = mock(ItineraryRepository.class);
        this.itineraryCollaboratorRepository = mock(ItineraryCollaboratorRepository.class);
        this.userService = mock(UserService.class);
        this.itineraryPermissionService = mock(ItineraryPermissionService.class);
        this.collaboratorMapper = mock(CollaboratorMapper.class);

        this.collaborationService = new ItineraryCollaborationService(
            itineraryRepository,
            itineraryCollaboratorRepository,
            userService,
            itineraryPermissionService,
            collaboratorMapper
        );

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
    @DisplayName("Test addCollaborator - Success")
    public void testAddCollaboratorSuccess() {
        AddCollaboratorRequest request = new AddCollaboratorRequest("collaborator", CollaboratorRoleDTO.VIEWER);
        
        when(itineraryRepository.findById(1L)).thenReturn(Optional.of(itinerary));
        when(userService.getAuthenticatedUser()).thenReturn(owner);
        when(itineraryPermissionService.canManageCollaborators(itinerary, owner)).thenReturn(true);
        when(userService.getUserByUsername("collaborator")).thenReturn(collaborator);
        when(itineraryCollaboratorRepository.existsByItineraryAndUser(itinerary, collaborator)).thenReturn(false);
        
        ItineraryCollaborator savedCollaborator = new ItineraryCollaborator(CollaboratorRole.VIEWER, collaborator, itinerary);
        when(itineraryCollaboratorRepository.save(any(ItineraryCollaborator.class))).thenReturn(savedCollaborator);
        
        PublicUserDTO publicUser = mock(PublicUserDTO.class);
        CollaboratorDTO expectedDTO = new CollaboratorDTO(1L, publicUser, CollaboratorRoleDTO.VIEWER, LocalDateTime.now());
        when(collaboratorMapper.toDTO(savedCollaborator)).thenReturn(expectedDTO);

        CollaboratorDTO result = collaborationService.addCollaborator(1L, request);

        assertEquals(expectedDTO, result);
        verify(itineraryCollaboratorRepository).save(any(ItineraryCollaborator.class));
    }

    @Test
    @DisplayName("Test addCollaborator - Fail if user is owner")
    public void testAddCollaboratorOwnerFail() {
        AddCollaboratorRequest request = new AddCollaboratorRequest("owner", CollaboratorRoleDTO.VIEWER);
        
        when(itineraryRepository.findById(1L)).thenReturn(Optional.of(itinerary));
        when(userService.getAuthenticatedUser()).thenReturn(owner);
        when(itineraryPermissionService.canManageCollaborators(itinerary, owner)).thenReturn(true);
        when(userService.getUserByUsername("owner")).thenReturn(owner);

        assertThrows(ResponseStatusException.class, () -> collaborationService.addCollaborator(1L, request));
    }

    @Test
    @DisplayName("Test removeCollaborator - Success")
    public void testRemoveCollaboratorSuccess() {
        RemoveCollaboratorRequest request = new RemoveCollaboratorRequest("collaborator");

        when(itineraryRepository.findById(1L)).thenReturn(Optional.of(itinerary));
        when(userService.getAuthenticatedUser()).thenReturn(owner);
        when(userService.getUserByUsername("collaborator")).thenReturn(collaborator);
        when(itineraryPermissionService.isOwner(itinerary, owner)).thenReturn(true);
        
        ItineraryCollaborator existingCollaborator = new ItineraryCollaborator(CollaboratorRole.VIEWER, collaborator, itinerary);
        when(itineraryCollaboratorRepository.findByItineraryAndUser(itinerary, collaborator)).thenReturn(Optional.of(existingCollaborator));

        collaborationService.removeCollaborator(1L, request);

        verify(itineraryCollaboratorRepository).delete(existingCollaborator);
    }
    
    @Test
    @DisplayName("Test updateCollaboratorRole - Success")
    public void testUpdateCollaboratorRoleSuccess() {
        UpdateCollaboratorRequest request = new UpdateCollaboratorRequest("collaborator", CollaboratorRoleDTO.EDITOR);

        when(itineraryRepository.findById(1L)).thenReturn(Optional.of(itinerary));
        when(userService.getAuthenticatedUser()).thenReturn(owner);
        when(itineraryPermissionService.canManageCollaborators(itinerary, owner)).thenReturn(true);
        when(userService.getUserByUsername("collaborator")).thenReturn(collaborator);

        ItineraryCollaborator existingCollaborator = new ItineraryCollaborator(CollaboratorRole.VIEWER, collaborator, itinerary);
        when(itineraryCollaboratorRepository.findByItineraryAndUser(itinerary, collaborator)).thenReturn(Optional.of(existingCollaborator));
        
        when(itineraryCollaboratorRepository.save(any(ItineraryCollaborator.class))).thenReturn(existingCollaborator);
        PublicUserDTO publicUser = mock(PublicUserDTO.class);
        when(collaboratorMapper.toDTO(any(ItineraryCollaborator.class))).thenReturn(new CollaboratorDTO(1L, publicUser, CollaboratorRoleDTO.EDITOR, LocalDateTime.now()));

        CollaboratorDTO result = collaborationService.updateCollaboratorRole(1L, request);
        
        assertEquals(CollaboratorRoleDTO.EDITOR, result.role());
    }
}
