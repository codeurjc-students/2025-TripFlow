package com.tripflow.unit;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import com.tripflow.dto.itinerary.ExtendedItineraryDTO;
import com.tripflow.dto.itinerary.ItineraryStatusDTO;
import com.tripflow.dto.itinerary.PermissionsDTO;
import com.tripflow.dto.itinerary.share.ShareLinkDTO;
import com.tripflow.mappers.ItineraryMapper;
import com.tripflow.model.User;
import com.tripflow.model.itinerary.Itinerary;
import com.tripflow.model.itinerary.ItineraryShareLink;
import com.tripflow.repository.itinerary.ItineraryRepository;
import com.tripflow.repository.itinerary.ItineraryShareLinkRepository;
import com.tripflow.service.UserService;
import com.tripflow.service.itinerary.ItineraryPermissionService;
import com.tripflow.service.itinerary.ItineraryShareLinkService;

@Tag("unit")
public class ItineraryShareLinkServiceTest {

    private ItineraryRepository itineraryRepository;
    private ItineraryShareLinkRepository itineraryShareLinkRepository;
    private UserService userService;
    private ItineraryPermissionService itineraryPermissionService;
    private ItineraryMapper itineraryMapper;

    private ItineraryShareLinkService shareLinkService;

    private Itinerary itinerary;

    @BeforeEach
    public void setUp() {
        this.itineraryRepository = mock(ItineraryRepository.class);
        this.itineraryShareLinkRepository = mock(ItineraryShareLinkRepository.class);
        this.userService = mock(UserService.class);
        this.itineraryPermissionService = mock(ItineraryPermissionService.class);
        this.itineraryMapper = mock(ItineraryMapper.class);

        this.shareLinkService = new ItineraryShareLinkService(
            itineraryRepository,
            itineraryShareLinkRepository,
            userService,
            itineraryPermissionService,
            itineraryMapper,
            168L
        );

        this.itinerary = new Itinerary();
        this.itinerary.setId(1L);
        this.itinerary.setTitle("Test itinerary");
    }

    @Test
    @DisplayName("Should return shared itinerary with read-only permissions for valid token")
    public void testGetSharedItineraryByTokenSuccess() {
        ItineraryShareLink shareLink = new ItineraryShareLink();
        shareLink.setToken("valid_token");
        shareLink.setItinerary(itinerary);
        shareLink.setExpiresAt(LocalDateTime.now().plusHours(1));
        shareLink.setRevokedAt(null);

        ExtendedItineraryDTO itineraryDTO = new ExtendedItineraryDTO(
            itinerary.getId(),
            "Trip",
            "Paris",
            2,
            1000.0,
            "2025-06-10",
            List.of("city"),
            1L,
            ItineraryStatusDTO.DRAFT,
            List.of(),
            0,
            null
        );

        when(itineraryShareLinkRepository.findByToken("valid_token")).thenReturn(Optional.of(shareLink));
        when(itineraryMapper.toExtendedDTO(itinerary)).thenReturn(itineraryDTO);

        PermissionsDTO permissions = shareLinkService.getSharedItineraryByToken("valid_token").permissions();

        assertTrue(permissions.view());
        assertFalse(permissions.edit());
        assertFalse(permissions.delete());
    }

    @Test
    @DisplayName("Should fail when token does not exist (404)")
    public void testGetSharedItineraryByTokenNotFound() {
        when(itineraryShareLinkRepository.findByToken("missing")).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
            () -> shareLinkService.getSharedItineraryByToken("missing"));

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    }

    @Test
    @DisplayName("Should fail when token is revoked (403)")
    public void testGetSharedItineraryByTokenRevoked() {
        ItineraryShareLink shareLink = new ItineraryShareLink();
        shareLink.setToken("revoked_token");
        shareLink.setItinerary(itinerary);
        shareLink.setExpiresAt(LocalDateTime.now().plusHours(1));
        shareLink.setRevokedAt(LocalDateTime.now());

        when(itineraryShareLinkRepository.findByToken("revoked_token")).thenReturn(Optional.of(shareLink));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
            () -> shareLinkService.getSharedItineraryByToken("revoked_token"));

        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
    }

    @Test
    @DisplayName("Should fail when token is expired (403)")
    public void testGetSharedItineraryByTokenExpired() {
        ItineraryShareLink shareLink = new ItineraryShareLink();
        shareLink.setToken("expired_token");
        shareLink.setItinerary(itinerary);
        shareLink.setExpiresAt(LocalDateTime.now().minusMinutes(1));
        shareLink.setRevokedAt(null);

        when(itineraryShareLinkRepository.findByToken("expired_token")).thenReturn(Optional.of(shareLink));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
            () -> shareLinkService.getSharedItineraryByToken("expired_token"));

        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
    }

    @Test
    @DisplayName("Should generate share link when owner has permission")
    public void testGenerateShareLinkSuccess() {
        User owner = new User();
        owner.setId(1L);
        owner.setUsername("owner");

        ItineraryShareLink saved = new ItineraryShareLink();
        saved.setId(10L);
        saved.setToken("abc123token");
        saved.setCreatedAt(LocalDateTime.now());
        saved.setExpiresAt(LocalDateTime.now().plusHours(168));
        saved.setRevokedAt(null);

        when(itineraryRepository.findById(1L)).thenReturn(Optional.of(itinerary));
        when(userService.getAuthenticatedUser()).thenReturn(owner);
        when(itineraryPermissionService.canManageCollaborators(itinerary, owner)).thenReturn(true);
        when(itineraryShareLinkRepository.save(org.mockito.ArgumentMatchers.any(ItineraryShareLink.class))).thenReturn(saved);

        ShareLinkDTO result = shareLinkService.generateShareLink(1L);

        assertEquals(10L, result.getId());
        assertEquals("abc123token", result.getToken());
        assertTrue(result.isActive());
    }
}
