package com.tripflow.controller.v1;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tripflow.dto.itinerary.collaborator.AddCollaboratorRequest;
import com.tripflow.dto.itinerary.collaborator.CollaboratorDTO;
import com.tripflow.dto.itinerary.collaborator.UpdateCollaboratorRequest;
import com.tripflow.service.itinerary.ItineraryCollaborationService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/v1/itineraries")
@Tag(name = "Itinerary Collaboration", description = "Endpoints for managing itinerary collaborators and invitations")
public class RestCollaborationController {
    private final ItineraryCollaborationService collaborationService;

    public RestCollaborationController(
        ItineraryCollaborationService collaborationService
    ) {
        this.collaborationService = collaborationService;
    }

    @PostMapping("/{itineraryId}/collaborators")
    @Operation(
        summary = "Send Invitation", 
        description = "Sends an invitation to a user to collaborate on an itinerary. Only owner can do this.",
        security = @SecurityRequirement(name = "auth_token")
    )
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Invitation sent"),
        @ApiResponse(responseCode = "400", description = "Invalid request or user is owner"),
        @ApiResponse(responseCode = "403", description = "Forbidden"),
        @ApiResponse(responseCode = "404", description = "Itinerary or user not found"),
        @ApiResponse(responseCode = "409", description = "User already has a pending invitation or is a collaborator")
    })
    public ResponseEntity<CollaboratorDTO> sendInvitation(
        @PathVariable Long itineraryId,
        @RequestBody AddCollaboratorRequest request
    ) {
        CollaboratorDTO collaborator = this.collaborationService.sendInvitation(itineraryId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(collaborator);
    }

    @PutMapping("/{itineraryId}/collaborators/{username}/accept")
    @Operation(
        summary = "Accept Invitation",
        description = "Accepts a pending invitation to collaborate on an itinerary.",
        security = @SecurityRequirement(name = "auth_token")
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Invitation accepted"),
        @ApiResponse(responseCode = "400", description = "Invitation is not pending"),
        @ApiResponse(responseCode = "404", description = "Invitation not found")
    })
    public ResponseEntity<CollaboratorDTO> acceptInvitation(
        @PathVariable Long itineraryId,
        @PathVariable String username
    ) {
        CollaboratorDTO collaborator = this.collaborationService.acceptInvitation(itineraryId, username);
        return ResponseEntity.ok(collaborator);
    }

    @DeleteMapping("/{itineraryId}/collaborators/{username}/decline")
    @Operation(
        summary = "Decline Invitation",
        description = "Declines a pending invitation to collaborate on an itinerary.",
        security = @SecurityRequirement(name = "auth_token")
    )
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "Invitation declined"),
        @ApiResponse(responseCode = "400", description = "Invitation is already accepted or invalid"),
        @ApiResponse(responseCode = "404", description = "Invitation not found")
    })
    public ResponseEntity<Void> declineInvitation(
        @PathVariable Long itineraryId,
        @PathVariable String username
    ) {
        this.collaborationService.declineInvitation(itineraryId, username);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{itineraryId}/collaborators")
    @Operation(
        summary = "Get Collaborators",
        description = "Gets all collaborators of an itinerary.",
        security = @SecurityRequirement(name = "auth_token")
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Collaborators found"),
        @ApiResponse(responseCode = "404", description = "Itinerary not found")
    })
    public ResponseEntity<List<CollaboratorDTO>> getCollaborators(@PathVariable Long itineraryId) {
        List<CollaboratorDTO> collaborators = this.collaborationService.getCollaborators(itineraryId);
        return ResponseEntity.ok(collaborators);
    }

    @PutMapping("/{itineraryId}/collaborators/{username}")
    @Operation(
        summary = "Update Collaborator Role",
        description = "Updates a collaborator's role. Only owner can do this.",
        security = @SecurityRequirement(name = "auth_token")
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Collaborator updated"),
        @ApiResponse(responseCode = "400", description = "Invalid request"),
        @ApiResponse(responseCode = "403", description = "Forbidden"),
        @ApiResponse(responseCode = "404", description = "Itinerary or collaborator not found")
    })
    public ResponseEntity<CollaboratorDTO> updateCollaboratorRole(
        @PathVariable Long itineraryId,
        @PathVariable String username,
        @RequestBody UpdateCollaboratorRequest request
    ) {
        CollaboratorDTO collaborator = this.collaborationService.updateCollaboratorRole(itineraryId, username, request);
        return ResponseEntity.ok(collaborator);
    }

    @DeleteMapping("/{itineraryId}/collaborators/{username}")
    @Operation(
        summary = "Remove Collaborator",
        description = "Removes a collaborator. Owner can remove anyone, collaborators can remove themselves.",
        security = @SecurityRequirement(name = "auth_token")
    )
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "Collaborator removed"),
        @ApiResponse(responseCode = "403", description = "Forbidden"),
        @ApiResponse(responseCode = "404", description = "Itinerary or collaborator not found")
    })
    public ResponseEntity<Void> removeCollaborator(
        @PathVariable Long itineraryId,
        @PathVariable String username
    ) {
        this.collaborationService.removeCollaborator(itineraryId, username);
        return ResponseEntity.noContent().build();
    }
}
