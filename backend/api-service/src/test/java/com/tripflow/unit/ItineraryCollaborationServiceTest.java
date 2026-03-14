package com.tripflow.unit;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.util.List;
import java.util.Optional;
import java.time.LocalDateTime;

import com.tripflow.dto.user.PublicUserDTO;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.server.ResponseStatusException;

import com.tripflow.dto.itinerary.collaborator.AddCollaboratorRequest;
import com.tripflow.dto.itinerary.collaborator.CollaboratorDTO;
import com.tripflow.dto.itinerary.collaborator.CollaboratorRoleDTO;
import com.tripflow.dto.itinerary.collaborator.InvitationStatusDTO;
import com.tripflow.dto.itinerary.collaborator.UpdateCollaboratorRequest;
import com.tripflow.kafka.messages.NotificationMessage;
import com.tripflow.mappers.CollaboratorMapper;
import com.tripflow.model.User;
import com.tripflow.model.itinerary.Itinerary;
import com.tripflow.model.itinerary.ItineraryCollaborator;
import com.tripflow.model.types.CollaboratorRole;
import com.tripflow.model.types.InvitationStatus;
import com.tripflow.repository.itinerary.ItineraryCollaboratorRepository;
import com.tripflow.repository.itinerary.ItineraryRepository;
import com.tripflow.service.KafkaService;
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
    private KafkaService kafkaService;

    private ItineraryCollaborationService collaborationService;

    private User owner;
    private User collaboratorUser;
    private User otherUser;
    private Itinerary itinerary;
    private PublicUserDTO publicCollaboratorDTO;

    @BeforeEach
    public void setUp() {
        this.itineraryRepository = mock(ItineraryRepository.class);
        this.itineraryCollaboratorRepository = mock(ItineraryCollaboratorRepository.class);
        this.userService = mock(UserService.class);
        this.itineraryPermissionService = mock(ItineraryPermissionService.class);
        this.collaboratorMapper = mock(CollaboratorMapper.class);
        this.kafkaService = mock(KafkaService.class);

        this.collaborationService = new ItineraryCollaborationService(
            itineraryRepository,
            itineraryCollaboratorRepository,
            userService,
            itineraryPermissionService,
            collaboratorMapper,
            kafkaService
        );

        this.owner = new User();
        this.owner.setId(1L);
        this.owner.setUsername("owner");

        this.collaboratorUser = new User();
        this.collaboratorUser.setId(2L);
        this.collaboratorUser.setUsername("collaborator");

        this.otherUser = new User();
        this.otherUser.setId(3L);
        this.otherUser.setUsername("other");

        this.itinerary = new Itinerary();
        this.itinerary.setId(1L);
        this.itinerary.setTitle("Test Trip");
        this.itinerary.setUser(this.owner);

        this.publicCollaboratorDTO = mock(PublicUserDTO.class);
    }

    // =========================================================================
    // sendInvitation
    // =========================================================================

    @Nested
    @DisplayName("sendInvitation")
    class SendInvitation {

        @Test
        @DisplayName("Success - creates collaborator with PENDING status and sends notification")
        public void testSuccess() {
            AddCollaboratorRequest request = new AddCollaboratorRequest("collaborator", CollaboratorRoleDTO.VIEWER);

            when(itineraryRepository.findById(1L)).thenReturn(Optional.of(itinerary));
            when(userService.getAuthenticatedUser()).thenReturn(owner);
            when(itineraryPermissionService.canManageCollaborators(itinerary, owner)).thenReturn(true);
            when(userService.getUserByUsername("collaborator")).thenReturn(collaboratorUser);
            when(itineraryCollaboratorRepository.existsByItineraryAndUser(itinerary, collaboratorUser)).thenReturn(false);

            ItineraryCollaborator saved = new ItineraryCollaborator(CollaboratorRole.VIEWER, collaboratorUser, itinerary);
            when(itineraryCollaboratorRepository.save(any(ItineraryCollaborator.class))).thenReturn(saved);

            CollaboratorDTO expectedDTO = new CollaboratorDTO(1L, publicCollaboratorDTO, "owner", CollaboratorRoleDTO.VIEWER, InvitationStatusDTO.PENDING, LocalDateTime.now(), null, 1L, "Test Trip");
            when(collaboratorMapper.toDTO(saved)).thenReturn(expectedDTO);

            CollaboratorDTO result = collaborationService.sendInvitation(1L, request);

            assertEquals(expectedDTO, result);
            assertEquals(InvitationStatusDTO.PENDING, result.status());
            verify(itineraryCollaboratorRepository).save(any(ItineraryCollaborator.class));
            verify(kafkaService).sendNotificationMessage(any(NotificationMessage.class));
        }

        @Test
        @DisplayName("Fail - non-owner cannot send invitations (403)")
        public void testForbiddenNonOwner() {
            AddCollaboratorRequest request = new AddCollaboratorRequest("collaborator", CollaboratorRoleDTO.VIEWER);

            when(itineraryRepository.findById(1L)).thenReturn(Optional.of(itinerary));
            when(userService.getAuthenticatedUser()).thenReturn(otherUser);
            when(itineraryPermissionService.canManageCollaborators(itinerary, otherUser)).thenReturn(false);

            ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> collaborationService.sendInvitation(1L, request));
            assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
        }

        @Test
        @DisplayName("Fail - cannot assign OWNER role (400)")
        public void testCannotAssignOwnerRole() {
            AddCollaboratorRequest request = new AddCollaboratorRequest("collaborator", CollaboratorRoleDTO.OWNER);

            when(itineraryRepository.findById(1L)).thenReturn(Optional.of(itinerary));
            when(userService.getAuthenticatedUser()).thenReturn(owner);
            when(itineraryPermissionService.canManageCollaborators(itinerary, owner)).thenReturn(true);

            ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> collaborationService.sendInvitation(1L, request));
            assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        }

        @Test
        @DisplayName("Fail - owner cannot be a collaborator (400)")
        public void testOwnerCannotBeCollaborator() {
            AddCollaboratorRequest request = new AddCollaboratorRequest("owner", CollaboratorRoleDTO.VIEWER);

            when(itineraryRepository.findById(1L)).thenReturn(Optional.of(itinerary));
            when(userService.getAuthenticatedUser()).thenReturn(owner);
            when(itineraryPermissionService.canManageCollaborators(itinerary, owner)).thenReturn(true);
            when(userService.getUserByUsername("owner")).thenReturn(owner);

            ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> collaborationService.sendInvitation(1L, request));
            assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        }

        @Test
        @DisplayName("Fail - user already invited or is collaborator (409)")
        public void testDuplicateInvitation() {
            AddCollaboratorRequest request = new AddCollaboratorRequest("collaborator", CollaboratorRoleDTO.VIEWER);

            when(itineraryRepository.findById(1L)).thenReturn(Optional.of(itinerary));
            when(userService.getAuthenticatedUser()).thenReturn(owner);
            when(itineraryPermissionService.canManageCollaborators(itinerary, owner)).thenReturn(true);
            when(userService.getUserByUsername("collaborator")).thenReturn(collaboratorUser);
            when(itineraryCollaboratorRepository.existsByItineraryAndUser(itinerary, collaboratorUser)).thenReturn(true);

            ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> collaborationService.sendInvitation(1L, request));
            assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
        }

        @Test
        @DisplayName("Fail - itinerary not found (404)")
        public void testItineraryNotFound() {
            AddCollaboratorRequest request = new AddCollaboratorRequest("collaborator", CollaboratorRoleDTO.VIEWER);

            when(itineraryRepository.findById(99L)).thenReturn(Optional.empty());

            ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> collaborationService.sendInvitation(99L, request));
            assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
        }

        @Test
        @DisplayName("Fail - invited user not found (404)")
        public void testUserNotFound() {
            AddCollaboratorRequest request = new AddCollaboratorRequest("nonexistent", CollaboratorRoleDTO.VIEWER);

            when(itineraryRepository.findById(1L)).thenReturn(Optional.of(itinerary));
            when(userService.getAuthenticatedUser()).thenReturn(owner);
            when(itineraryPermissionService.canManageCollaborators(itinerary, owner)).thenReturn(true);
            when(userService.getUserByUsername("nonexistent")).thenThrow(new UsernameNotFoundException("not found"));

            ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> collaborationService.sendInvitation(1L, request));
            assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
        }

        @Test
        @DisplayName("Success - invitation with EDITOR role")
        public void testSuccessEditorRole() {
            AddCollaboratorRequest request = new AddCollaboratorRequest("collaborator", CollaboratorRoleDTO.EDITOR);

            when(itineraryRepository.findById(1L)).thenReturn(Optional.of(itinerary));
            when(userService.getAuthenticatedUser()).thenReturn(owner);
            when(itineraryPermissionService.canManageCollaborators(itinerary, owner)).thenReturn(true);
            when(userService.getUserByUsername("collaborator")).thenReturn(collaboratorUser);
            when(itineraryCollaboratorRepository.existsByItineraryAndUser(itinerary, collaboratorUser)).thenReturn(false);

            ItineraryCollaborator saved = new ItineraryCollaborator(CollaboratorRole.EDITOR, collaboratorUser, itinerary);
            when(itineraryCollaboratorRepository.save(any(ItineraryCollaborator.class))).thenReturn(saved);

            CollaboratorDTO expectedDTO = new CollaboratorDTO(1L, publicCollaboratorDTO, "owner", CollaboratorRoleDTO.EDITOR, InvitationStatusDTO.PENDING, LocalDateTime.now(), null, 1L, "Test Trip");
            when(collaboratorMapper.toDTO(saved)).thenReturn(expectedDTO);

            CollaboratorDTO result = collaborationService.sendInvitation(1L, request);

            assertEquals(CollaboratorRoleDTO.EDITOR, result.role());
        }
    }

    // =========================================================================
    // acceptInvitation
    // =========================================================================

    @Nested
    @DisplayName("acceptInvitation")
    class AcceptInvitation {

        @Test
        @DisplayName("Success - sets status to ACCEPTED, sets acceptedAt, sends notification")
        public void testSuccess() {
            when(itineraryRepository.findById(1L)).thenReturn(Optional.of(itinerary));
            when(userService.getUserByUsername("collaborator")).thenReturn(collaboratorUser);
            when(userService.getAuthenticatedUser()).thenReturn(collaboratorUser);

            ItineraryCollaborator pending = new ItineraryCollaborator(CollaboratorRole.VIEWER, collaboratorUser, itinerary);
            when(itineraryCollaboratorRepository.findByItineraryAndUser(itinerary, collaboratorUser)).thenReturn(Optional.of(pending));
            when(itineraryCollaboratorRepository.save(any(ItineraryCollaborator.class))).thenReturn(pending);

            CollaboratorDTO expectedDTO = new CollaboratorDTO(1L, publicCollaboratorDTO, "owner", CollaboratorRoleDTO.VIEWER, InvitationStatusDTO.ACCEPTED, LocalDateTime.now(), LocalDateTime.now(), 1L, "Test Trip");
            when(collaboratorMapper.toDTO(any(ItineraryCollaborator.class))).thenReturn(expectedDTO);

            CollaboratorDTO result = collaborationService.acceptInvitation(1L, "collaborator");

            assertEquals(InvitationStatusDTO.ACCEPTED, result.status());
            assertNotNull(result.acceptedAt());
            verify(itineraryCollaboratorRepository).save(any(ItineraryCollaborator.class));
            verify(kafkaService).sendNotificationMessage(any(NotificationMessage.class));
        }

        @Test
        @DisplayName("Fail - another user cannot accept someone else's invitation (403)")
        public void testForbiddenOtherUser() {
            when(itineraryRepository.findById(1L)).thenReturn(Optional.of(itinerary));
            when(userService.getUserByUsername("collaborator")).thenReturn(collaboratorUser);
            when(userService.getAuthenticatedUser()).thenReturn(otherUser);

            ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> collaborationService.acceptInvitation(1L, "collaborator"));
            assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
        }

        @Test
        @DisplayName("Fail - invitation not found (404)")
        public void testInvitationNotFound() {
            when(itineraryRepository.findById(1L)).thenReturn(Optional.of(itinerary));
            when(userService.getUserByUsername("collaborator")).thenReturn(collaboratorUser);
            when(userService.getAuthenticatedUser()).thenReturn(collaboratorUser);
            when(itineraryCollaboratorRepository.findByItineraryAndUser(itinerary, collaboratorUser)).thenReturn(Optional.empty());

            ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> collaborationService.acceptInvitation(1L, "collaborator"));
            assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
        }

        @Test
        @DisplayName("Fail - invitation already accepted (400)")
        public void testAlreadyAccepted() {
            when(itineraryRepository.findById(1L)).thenReturn(Optional.of(itinerary));
            when(userService.getUserByUsername("collaborator")).thenReturn(collaboratorUser);
            when(userService.getAuthenticatedUser()).thenReturn(collaboratorUser);

            ItineraryCollaborator accepted = new ItineraryCollaborator(CollaboratorRole.VIEWER, collaboratorUser, itinerary);
            accepted.setStatus(InvitationStatus.ACCEPTED);
            when(itineraryCollaboratorRepository.findByItineraryAndUser(itinerary, collaboratorUser)).thenReturn(Optional.of(accepted));

            ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> collaborationService.acceptInvitation(1L, "collaborator"));
            assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        }

        @Test
        @DisplayName("Fail - itinerary not found (404)")
        public void testItineraryNotFound() {
            when(itineraryRepository.findById(99L)).thenReturn(Optional.empty());

            ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> collaborationService.acceptInvitation(99L, "collaborator"));
            assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
        }
    }

    // =========================================================================
    // declineInvitation
    // =========================================================================

    @Nested
    @DisplayName("declineInvitation")
    class DeclineInvitation {

        @Test
        @DisplayName("Success - deletes the pending invitation")
        public void testSuccess() {
            when(itineraryRepository.findById(1L)).thenReturn(Optional.of(itinerary));
            when(userService.getUserByUsername("collaborator")).thenReturn(collaboratorUser);
            when(userService.getAuthenticatedUser()).thenReturn(collaboratorUser);

            ItineraryCollaborator pending = new ItineraryCollaborator(CollaboratorRole.VIEWER, collaboratorUser, itinerary);
            when(itineraryCollaboratorRepository.findByItineraryAndUser(itinerary, collaboratorUser)).thenReturn(Optional.of(pending));

            collaborationService.declineInvitation(1L, "collaborator");

            verify(itineraryCollaboratorRepository).delete(pending);
        }

        @Test
        @DisplayName("Fail - another user cannot decline someone else's invitation (403)")
        public void testForbiddenOtherUser() {
            when(itineraryRepository.findById(1L)).thenReturn(Optional.of(itinerary));
            when(userService.getUserByUsername("collaborator")).thenReturn(collaboratorUser);
            when(userService.getAuthenticatedUser()).thenReturn(otherUser);

            ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> collaborationService.declineInvitation(1L, "collaborator"));
            assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
        }

        @Test
        @DisplayName("Fail - invitation not found (404)")
        public void testInvitationNotFound() {
            when(itineraryRepository.findById(1L)).thenReturn(Optional.of(itinerary));
            when(userService.getUserByUsername("collaborator")).thenReturn(collaboratorUser);
            when(userService.getAuthenticatedUser()).thenReturn(collaboratorUser);
            when(itineraryCollaboratorRepository.findByItineraryAndUser(itinerary, collaboratorUser)).thenReturn(Optional.empty());

            ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> collaborationService.declineInvitation(1L, "collaborator"));
            assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
        }

        @Test
        @DisplayName("Fail - cannot decline an already accepted invitation (400)")
        public void testAlreadyAccepted() {
            when(itineraryRepository.findById(1L)).thenReturn(Optional.of(itinerary));
            when(userService.getUserByUsername("collaborator")).thenReturn(collaboratorUser);
            when(userService.getAuthenticatedUser()).thenReturn(collaboratorUser);

            ItineraryCollaborator accepted = new ItineraryCollaborator(CollaboratorRole.VIEWER, collaboratorUser, itinerary);
            accepted.setStatus(InvitationStatus.ACCEPTED);
            when(itineraryCollaboratorRepository.findByItineraryAndUser(itinerary, collaboratorUser)).thenReturn(Optional.of(accepted));

            ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> collaborationService.declineInvitation(1L, "collaborator"));
            assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        }

        @Test
        @DisplayName("Fail - itinerary not found (404)")
        public void testItineraryNotFound() {
            when(itineraryRepository.findById(99L)).thenReturn(Optional.empty());

            ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> collaborationService.declineInvitation(99L, "collaborator"));
            assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
        }
    }

    // =========================================================================
    // updateCollaboratorRole
    // =========================================================================

    @Nested
    @DisplayName("updateCollaboratorRole")
    class UpdateCollaboratorRole {

        @Test
        @DisplayName("Success - updates role of an ACCEPTED collaborator")
        public void testSuccess() {
            UpdateCollaboratorRequest request = new UpdateCollaboratorRequest(CollaboratorRoleDTO.EDITOR);

            when(itineraryRepository.findById(1L)).thenReturn(Optional.of(itinerary));
            when(userService.getAuthenticatedUser()).thenReturn(owner);
            when(itineraryPermissionService.canManageCollaborators(itinerary, owner)).thenReturn(true);
            when(userService.getUserByUsername("collaborator")).thenReturn(collaboratorUser);

            ItineraryCollaborator existing = new ItineraryCollaborator(CollaboratorRole.VIEWER, collaboratorUser, itinerary);
            existing.setStatus(InvitationStatus.ACCEPTED);
            when(itineraryCollaboratorRepository.findByItineraryAndUser(itinerary, collaboratorUser)).thenReturn(Optional.of(existing));
            when(itineraryCollaboratorRepository.save(any(ItineraryCollaborator.class))).thenReturn(existing);

            CollaboratorDTO expectedDTO = new CollaboratorDTO(1L, publicCollaboratorDTO, "owner", CollaboratorRoleDTO.EDITOR, InvitationStatusDTO.ACCEPTED, LocalDateTime.now(), LocalDateTime.now(), 1L, "Test Trip");
            when(collaboratorMapper.toDTO(any(ItineraryCollaborator.class))).thenReturn(expectedDTO);

            CollaboratorDTO result = collaborationService.updateCollaboratorRole(1L, "collaborator", request);

            assertEquals(CollaboratorRoleDTO.EDITOR, result.role());
            verify(itineraryCollaboratorRepository).save(any(ItineraryCollaborator.class));
        }

        @Test
        @DisplayName("Fail - non-owner cannot update roles (403)")
        public void testForbiddenNonOwner() {
            UpdateCollaboratorRequest request = new UpdateCollaboratorRequest(CollaboratorRoleDTO.EDITOR);

            when(itineraryRepository.findById(1L)).thenReturn(Optional.of(itinerary));
            when(userService.getAuthenticatedUser()).thenReturn(otherUser);
            when(itineraryPermissionService.canManageCollaborators(itinerary, otherUser)).thenReturn(false);

            ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> collaborationService.updateCollaboratorRole(1L, "collaborator", request));
            assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
        }

        @Test
        @DisplayName("Fail - cannot assign OWNER role (400)")
        public void testCannotAssignOwnerRole() {
            UpdateCollaboratorRequest request = new UpdateCollaboratorRequest(CollaboratorRoleDTO.OWNER);

            when(itineraryRepository.findById(1L)).thenReturn(Optional.of(itinerary));
            when(userService.getAuthenticatedUser()).thenReturn(owner);
            when(itineraryPermissionService.canManageCollaborators(itinerary, owner)).thenReturn(true);

            ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> collaborationService.updateCollaboratorRole(1L, "collaborator", request));
            assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        }

        @Test
        @DisplayName("Fail - collaborator not found (404)")
        public void testCollaboratorNotFound() {
            UpdateCollaboratorRequest request = new UpdateCollaboratorRequest(CollaboratorRoleDTO.EDITOR);

            when(itineraryRepository.findById(1L)).thenReturn(Optional.of(itinerary));
            when(userService.getAuthenticatedUser()).thenReturn(owner);
            when(itineraryPermissionService.canManageCollaborators(itinerary, owner)).thenReturn(true);
            when(userService.getUserByUsername("collaborator")).thenReturn(collaboratorUser);
            when(itineraryCollaboratorRepository.findByItineraryAndUser(itinerary, collaboratorUser)).thenReturn(Optional.empty());

            ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> collaborationService.updateCollaboratorRole(1L, "collaborator", request));
            assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
        }

        @Test
        @DisplayName("Fail - cannot update role of PENDING collaborator (400)")
        public void testCannotUpdatePendingCollaborator() {
            UpdateCollaboratorRequest request = new UpdateCollaboratorRequest(CollaboratorRoleDTO.EDITOR);

            when(itineraryRepository.findById(1L)).thenReturn(Optional.of(itinerary));
            when(userService.getAuthenticatedUser()).thenReturn(owner);
            when(itineraryPermissionService.canManageCollaborators(itinerary, owner)).thenReturn(true);
            when(userService.getUserByUsername("collaborator")).thenReturn(collaboratorUser);

            ItineraryCollaborator pending = new ItineraryCollaborator(CollaboratorRole.VIEWER, collaboratorUser, itinerary);
            // Status is PENDING by default from constructor
            when(itineraryCollaboratorRepository.findByItineraryAndUser(itinerary, collaboratorUser)).thenReturn(Optional.of(pending));

            ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> collaborationService.updateCollaboratorRole(1L, "collaborator", request));
            assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        }

        @Test
        @DisplayName("Fail - itinerary not found (404)")
        public void testItineraryNotFound() {
            UpdateCollaboratorRequest request = new UpdateCollaboratorRequest(CollaboratorRoleDTO.EDITOR);

            when(itineraryRepository.findById(99L)).thenReturn(Optional.empty());

            ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> collaborationService.updateCollaboratorRole(99L, "collaborator", request));
            assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
        }
    }

    // =========================================================================
    // removeCollaborator
    // =========================================================================

    @Nested
    @DisplayName("removeCollaborator")
    class RemoveCollaborator {

        @Test
        @DisplayName("Success - owner removes a collaborator")
        public void testOwnerRemoves() {
            when(itineraryRepository.findById(1L)).thenReturn(Optional.of(itinerary));
            when(userService.getAuthenticatedUser()).thenReturn(owner);
            when(userService.getUserByUsername("collaborator")).thenReturn(collaboratorUser);
            when(itineraryPermissionService.isOwner(itinerary, owner)).thenReturn(true);

            ItineraryCollaborator existing = new ItineraryCollaborator(CollaboratorRole.VIEWER, collaboratorUser, itinerary);
            when(itineraryCollaboratorRepository.findByItineraryAndUser(itinerary, collaboratorUser)).thenReturn(Optional.of(existing));

            collaborationService.removeCollaborator(1L, "collaborator");

            verify(itineraryCollaboratorRepository).delete(existing);
        }

        @Test
        @DisplayName("Success - collaborator removes themselves (self-removal)")
        public void testSelfRemoval() {
            when(itineraryRepository.findById(1L)).thenReturn(Optional.of(itinerary));
            when(userService.getAuthenticatedUser()).thenReturn(collaboratorUser);
            when(userService.getUserByUsername("collaborator")).thenReturn(collaboratorUser);
            when(itineraryPermissionService.isOwner(itinerary, collaboratorUser)).thenReturn(false);

            ItineraryCollaborator existing = new ItineraryCollaborator(CollaboratorRole.VIEWER, collaboratorUser, itinerary);
            when(itineraryCollaboratorRepository.findByItineraryAndUser(itinerary, collaboratorUser)).thenReturn(Optional.of(existing));

            collaborationService.removeCollaborator(1L, "collaborator");

            verify(itineraryCollaboratorRepository).delete(existing);
        }

        @Test
        @DisplayName("Fail - non-owner cannot remove another collaborator (403)")
        public void testForbiddenNonOwnerNonSelf() {
            when(itineraryRepository.findById(1L)).thenReturn(Optional.of(itinerary));
            when(userService.getAuthenticatedUser()).thenReturn(otherUser);
            when(userService.getUserByUsername("collaborator")).thenReturn(collaboratorUser);
            when(itineraryPermissionService.isOwner(itinerary, otherUser)).thenReturn(false);

            ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> collaborationService.removeCollaborator(1L, "collaborator"));
            assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
        }

        @Test
        @DisplayName("Fail - collaborator not found (404)")
        public void testCollaboratorNotFound() {
            when(itineraryRepository.findById(1L)).thenReturn(Optional.of(itinerary));
            when(userService.getAuthenticatedUser()).thenReturn(owner);
            when(userService.getUserByUsername("collaborator")).thenReturn(collaboratorUser);
            when(itineraryPermissionService.isOwner(itinerary, owner)).thenReturn(true);
            when(itineraryCollaboratorRepository.findByItineraryAndUser(itinerary, collaboratorUser)).thenReturn(Optional.empty());

            ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> collaborationService.removeCollaborator(1L, "collaborator"));
            assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
        }

        @Test
        @DisplayName("Fail - itinerary not found (404)")
        public void testItineraryNotFound() {
            when(itineraryRepository.findById(99L)).thenReturn(Optional.empty());

            ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> collaborationService.removeCollaborator(99L, "collaborator"));
            assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
        }
    }

    // =========================================================================
    // getCollaborators
    // =========================================================================

    @Nested
    @DisplayName("getCollaborators")
    class GetCollaborators {

        @Test
        @DisplayName("Success - returns owner as first entry plus all collaborators")
        public void testSuccessIncludesOwner() {
            when(itineraryRepository.findById(1L)).thenReturn(Optional.of(itinerary));
            when(userService.getAuthenticatedUser()).thenReturn(owner);
            when(itineraryPermissionService.canView(itinerary, owner)).thenReturn(true);

            ItineraryCollaborator collab = new ItineraryCollaborator(CollaboratorRole.VIEWER, collaboratorUser, itinerary);
            collab.setStatus(InvitationStatus.ACCEPTED);
            when(itineraryCollaboratorRepository.findByItinerary(itinerary)).thenReturn(List.of(collab));

            CollaboratorDTO collabDTO = new CollaboratorDTO(2L, publicCollaboratorDTO, "owner", CollaboratorRoleDTO.VIEWER, InvitationStatusDTO.ACCEPTED, LocalDateTime.now(), LocalDateTime.now(), 1L, "Test Trip");
            when(collaboratorMapper.toDTOs(List.of(collab))).thenReturn(List.of(collabDTO));

            List<CollaboratorDTO> result = collaborationService.getCollaborators(1L);

            assertEquals(1, result.size());
            assertEquals(collabDTO, result.get(0));
        }

        @Test
        @DisplayName("Fail - user without view permission (403)")
        public void testForbidden() {
            when(itineraryRepository.findById(1L)).thenReturn(Optional.of(itinerary));
            when(userService.getAuthenticatedUser()).thenReturn(otherUser);
            when(itineraryPermissionService.canView(itinerary, otherUser)).thenReturn(false);

            ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> collaborationService.getCollaborators(1L));
            assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
        }

        @Test
        @DisplayName("Fail - itinerary not found (404)")
        public void testItineraryNotFound() {
            when(itineraryRepository.findById(99L)).thenReturn(Optional.empty());

            ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> collaborationService.getCollaborators(99L));
            assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
        }
    }

    // =========================================================================
    // getPendingInvitations
    // =========================================================================

    @Nested
    @DisplayName("getPendingInvitations")
    class GetPendingInvitations {

        @Test
        @DisplayName("Success - returns pending invitations for the authenticated user")
        public void testSuccess() {
            when(userService.getUserByUsername("collaborator")).thenReturn(collaboratorUser);
            when(userService.getAuthenticatedUser()).thenReturn(collaboratorUser);

            ItineraryCollaborator pending = new ItineraryCollaborator(CollaboratorRole.VIEWER, collaboratorUser, itinerary);
            when(itineraryCollaboratorRepository.findByUserAndStatus(collaboratorUser, InvitationStatus.PENDING)).thenReturn(List.of(pending));

            CollaboratorDTO pendingDTO = new CollaboratorDTO(1L, publicCollaboratorDTO, "owner", CollaboratorRoleDTO.VIEWER, InvitationStatusDTO.PENDING, LocalDateTime.now(), null, 1L, "Test Trip");
            when(collaboratorMapper.toDTOs(List.of(pending))).thenReturn(List.of(pendingDTO));

            List<CollaboratorDTO> result = collaborationService.getPendingInvitations("collaborator");

            assertEquals(1, result.size());
            assertEquals(InvitationStatusDTO.PENDING, result.get(0).status());
            assertEquals(1L, result.get(0).itineraryId());
        }

        @Test
        @DisplayName("Success - returns empty list when no pending invitations exist")
        public void testEmptyList() {
            when(userService.getUserByUsername("collaborator")).thenReturn(collaboratorUser);
            when(userService.getAuthenticatedUser()).thenReturn(collaboratorUser);
            when(itineraryCollaboratorRepository.findByUserAndStatus(collaboratorUser, InvitationStatus.PENDING)).thenReturn(List.of());
            when(collaboratorMapper.toDTOs(List.of())).thenReturn(List.of());

            List<CollaboratorDTO> result = collaborationService.getPendingInvitations("collaborator");

            assertTrue(result.isEmpty());
        }

        @Test
        @DisplayName("Fail - cannot view another user's invitations (403)")
        public void testForbiddenOtherUser() {
            when(userService.getUserByUsername("collaborator")).thenReturn(collaboratorUser);
            when(userService.getAuthenticatedUser()).thenReturn(otherUser);

            ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> collaborationService.getPendingInvitations("collaborator"));
            assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
        }

        @Test
        @DisplayName("Fail - user not found (404)")
        public void testUserNotFound() {
            when(userService.getUserByUsername("nonexistent")).thenThrow(new UsernameNotFoundException("not found"));

            ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> collaborationService.getPendingInvitations("nonexistent"));
            assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
        }
    }
}
