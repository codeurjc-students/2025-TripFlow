package com.tripflow.service.itinerary;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.tripflow.dto.itinerary.ExtendedItineraryDTO;
import com.tripflow.dto.itinerary.ExtendedItineraryResponseDTO;
import com.tripflow.dto.itinerary.PermissionsDTO;
import com.tripflow.dto.itinerary.share.ShareLinkDTO;
import com.tripflow.mappers.ItineraryMapper;
import com.tripflow.model.User;
import com.tripflow.model.itinerary.Itinerary;
import com.tripflow.model.itinerary.ItineraryShareLink;
import com.tripflow.repository.itinerary.ItineraryRepository;
import com.tripflow.repository.itinerary.ItineraryShareLinkRepository;
import com.tripflow.service.UserService;

import jakarta.transaction.Transactional;

@Service
@Transactional
public class ItineraryShareLinkService {
    private final ItineraryRepository itineraryRepository;
    private final ItineraryShareLinkRepository itineraryShareLinkRepository;
    private final UserService userService;
    private final ItineraryPermissionService itineraryPermissionService;
    private final ItineraryMapper itineraryMapper;
    private final long shareLinkTtlHours;

    public ItineraryShareLinkService(
        ItineraryRepository itineraryRepository,
        ItineraryShareLinkRepository itineraryShareLinkRepository,
        UserService userService,
        ItineraryPermissionService itineraryPermissionService,
        ItineraryMapper itineraryMapper,
        @Value("${collaboration.share-link.ttl-hours:168}") long shareLinkTtlHours
    ) {
        this.itineraryRepository = itineraryRepository;
        this.itineraryShareLinkRepository = itineraryShareLinkRepository;
        this.userService = userService;
        this.itineraryPermissionService = itineraryPermissionService;
        this.itineraryMapper = itineraryMapper;
        this.shareLinkTtlHours = shareLinkTtlHours;
    }

    public ShareLinkDTO generateShareLink(Long itineraryId) {
        Itinerary itinerary = this.getItineraryOrThrow(itineraryId);
        User authenticatedUser = this.userService.getAuthenticatedUser();

        if (!this.itineraryPermissionService.canManageCollaborators(itinerary, authenticatedUser)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the owner can generate share links");
        }

        LocalDateTime now = LocalDateTime.now();

        ItineraryShareLink shareLink = new ItineraryShareLink();
        shareLink.setToken(this.generateToken());
        shareLink.setItinerary(itinerary);
        shareLink.setCreatedBy(authenticatedUser);
        shareLink.setExpiresAt(now.plusHours(this.shareLinkTtlHours));

        return this.toDTO(this.itineraryShareLinkRepository.save(shareLink));
    }

    public List<ShareLinkDTO> getActiveShareLinks(Long itineraryId) {
        Itinerary itinerary = this.getItineraryOrThrow(itineraryId);
        User authenticatedUser = this.userService.getAuthenticatedUser();

        if (!this.itineraryPermissionService.canView(itinerary, authenticatedUser)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have permission to view share links");
        }

        return this.itineraryShareLinkRepository
            .findByItineraryAndRevokedAtIsNullAndExpiresAtAfterOrderByCreatedAtDesc(itinerary, LocalDateTime.now())
            .stream()
            .map(this::toDTO)
            .toList();
    }

    public void revokeShareLink(Long itineraryId, Long shareLinkId) {
        Itinerary itinerary = this.getItineraryOrThrow(itineraryId);
        User authenticatedUser = this.userService.getAuthenticatedUser();

        if (!this.itineraryPermissionService.canManageCollaborators(itinerary, authenticatedUser)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the owner can revoke share links");
        }

        ItineraryShareLink shareLink = this.itineraryShareLinkRepository
            .findByIdAndItinerary(shareLinkId, itinerary)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Share link not found"));

        if (shareLink.getRevokedAt() == null) {
            shareLink.setRevokedAt(LocalDateTime.now());
            this.itineraryShareLinkRepository.save(shareLink);
        }
    }

    public ExtendedItineraryResponseDTO getSharedItineraryByToken(String token) {
        ItineraryShareLink shareLink = this.itineraryShareLinkRepository
            .findByToken(token)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Share link not found"));

        LocalDateTime now = LocalDateTime.now();
        if (shareLink.getRevokedAt() != null || !shareLink.getExpiresAt().isAfter(now)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Share link is no longer valid");
        }

        ExtendedItineraryDTO itineraryDTO = this.itineraryMapper.toExtendedDTO(shareLink.getItinerary());
        return new ExtendedItineraryResponseDTO(itineraryDTO, new PermissionsDTO(true, false, false));
    }

    private String generateToken() {
        return UUID.randomUUID().toString().replace("-", "");
    }

    private ShareLinkDTO toDTO(ItineraryShareLink shareLink) {
        boolean isActive = shareLink.getRevokedAt() == null && shareLink.getExpiresAt().isAfter(LocalDateTime.now());
        return new ShareLinkDTO(
            shareLink.getId(),
            shareLink.getToken(),
            shareLink.getCreatedAt(),
            shareLink.getExpiresAt(),
            isActive
        );
    }

    private Itinerary getItineraryOrThrow(Long id) {
        return this.itineraryRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Itinerary not found"));
    }
}
