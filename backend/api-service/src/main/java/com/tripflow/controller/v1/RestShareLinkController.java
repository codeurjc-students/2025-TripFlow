package com.tripflow.controller.v1;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tripflow.dto.itinerary.ExtendedItineraryResponseDTO;
import com.tripflow.dto.itinerary.share.ShareLinkDTO;
import com.tripflow.service.itinerary.ItineraryShareLinkService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/v1")
@Tag(name = "Itinerary Share Links", description = "Endpoints for generating and consuming itinerary share links")
public class RestShareLinkController {
    private final ItineraryShareLinkService itineraryShareLinkService;

    public RestShareLinkController(ItineraryShareLinkService itineraryShareLinkService) {
        this.itineraryShareLinkService = itineraryShareLinkService;
    }

    @PostMapping("/itineraries/{itineraryId}/share-links")
    @Operation(
        summary = "Generate Share Link",
        description = "Generates a public read-only share link with fixed expiration. Only itinerary owner can generate.",
        security = @SecurityRequirement(name = "auth_token")
    )
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Share link generated"),
        @ApiResponse(responseCode = "403", description = "Forbidden"),
        @ApiResponse(responseCode = "404", description = "Itinerary not found")
    })
    public ResponseEntity<ShareLinkDTO> generateShareLink(@PathVariable Long itineraryId) {
        ShareLinkDTO shareLink = this.itineraryShareLinkService.generateShareLink(itineraryId);
        return ResponseEntity.status(HttpStatus.CREATED).body(shareLink);
    }

    @GetMapping("/itineraries/{itineraryId}/share-links")
    @Operation(
        summary = "Get Active Share Links",
        description = "Returns active share links for an itinerary. Owner and accepted collaborators can view.",
        security = @SecurityRequirement(name = "auth_token")
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Share links retrieved"),
        @ApiResponse(responseCode = "403", description = "Forbidden"),
        @ApiResponse(responseCode = "404", description = "Itinerary not found")
    })
    public ResponseEntity<List<ShareLinkDTO>> getActiveShareLinks(@PathVariable Long itineraryId) {
        List<ShareLinkDTO> shareLinks = this.itineraryShareLinkService.getActiveShareLinks(itineraryId);
        return ResponseEntity.ok(shareLinks);
    }

    @DeleteMapping("/itineraries/{itineraryId}/share-links/{shareLinkId}")
    @Operation(
        summary = "Revoke Share Link",
        description = "Revokes a share link. Only itinerary owner can revoke.",
        security = @SecurityRequirement(name = "auth_token")
    )
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "Share link revoked"),
        @ApiResponse(responseCode = "403", description = "Forbidden"),
        @ApiResponse(responseCode = "404", description = "Itinerary or share link not found")
    })
    public ResponseEntity<Void> revokeShareLink(
        @PathVariable Long itineraryId,
        @PathVariable Long shareLinkId
    ) {
        this.itineraryShareLinkService.revokeShareLink(itineraryId, shareLinkId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/share/{token}")
    @Operation(
        summary = "Get Shared Itinerary",
        description = "Returns a read-only itinerary by share token. Public endpoint."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Shared itinerary retrieved"),
        @ApiResponse(responseCode = "403", description = "Share link expired or revoked"),
        @ApiResponse(responseCode = "404", description = "Share link not found")
    })
    public ResponseEntity<ExtendedItineraryResponseDTO> getSharedItinerary(@PathVariable String token) {
        ExtendedItineraryResponseDTO itinerary = this.itineraryShareLinkService.getSharedItineraryByToken(token);
        return ResponseEntity.ok(itinerary);
    }
}
