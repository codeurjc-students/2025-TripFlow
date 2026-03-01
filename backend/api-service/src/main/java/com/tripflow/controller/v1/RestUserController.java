package com.tripflow.controller.v1;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.tripflow.dto.shared.PaginatedDTO;
import com.tripflow.dto.itinerary.collaborator.CollaboratorDTO;
import com.tripflow.dto.user.PublicUserDTO;
import com.tripflow.dto.user.UpdateUserRequest;
import com.tripflow.service.UserService;
import com.tripflow.service.itinerary.ItineraryCollaborationService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.net.URI;
import java.util.List;

import org.springframework.core.io.Resource;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RestController
@RequestMapping("/api/v1/users")
@Tag(name = "Users Management", description = "User management and operations")
public class RestUserController {
    private final UserService userService;
    private final ItineraryCollaborationService collaborationService;

    public RestUserController(
        UserService userService,
        ItineraryCollaborationService collaborationService
    ) {
        this.userService = userService;
        this.collaborationService = collaborationService;
    }

    @GetMapping("")
    @Operation(
        summary = "Get all users",
        description = "Retrieves a list of all users."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Users retrieved successfully"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<PaginatedDTO<PublicUserDTO>> getAllUsers(
        @PageableDefault(page = 0, size = 10) Pageable pageable,
        @RequestParam(required = false) String search
    ) throws Exception {
        PaginatedDTO<PublicUserDTO> users = this.userService.getAllUsers(pageable, search);
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{username}")
    @Operation(
        summary = "Get user by username",
        description = "Retrieves a user by their username."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "User retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "User not found"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<PublicUserDTO> getUserByUsername(@PathVariable String username) throws Exception {
        PublicUserDTO user = this.userService.getPublicUserByUsername(username);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/{username}")
    @Operation(
        summary = "Update user by username",
        description = "Updates a user by their username.",
        security = @SecurityRequirement(name = "auth_token")
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "User updated successfully"),
        @ApiResponse(responseCode = "403", description = "Forbidden"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<PublicUserDTO> updateUser(
        @PathVariable String username, @RequestBody UpdateUserRequest request
    ) throws Exception {
        PublicUserDTO user = this.userService.updateUser(username, request);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest().build().toUri();
        return ResponseEntity.ok().location(location).body(user);
    }

    @DeleteMapping("/{username}")
    @Operation(
        summary = "Delete user by username",
        description = "Deletes a user by their username.",
        security = @SecurityRequirement(name = "auth_token")
    )
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "User deleted successfully"),
        @ApiResponse(responseCode = "403", description = "Forbidden"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<Void> deleteUser(@PathVariable String username) throws Exception {
        this.userService.deleteUser(username);
        return ResponseEntity.noContent().build();
    }
    
    @PostMapping("/{username}/avatar")
    @Operation(
        summary = "Upload avatar for user by username",
        description = "Uploads an avatar for a user by their username.",
        security = @SecurityRequirement(name = "auth_token")
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Avatar uploaded successfully"),
        @ApiResponse(responseCode = "403", description = "Forbidden"),
        @ApiResponse(responseCode = "415", description = "Unsupported media type"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<PublicUserDTO> uploadAvatar(
        @PathVariable String username, @RequestParam MultipartFile avatar
    ) throws Exception {
        PublicUserDTO user = this.userService.uploadAvatar(username, avatar);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest().build().toUri();
        return ResponseEntity.ok().location(location).body(user);
    }
    
    @GetMapping("/{username}/avatar")
    @Operation(
        summary = "Get avatar for user by username",
        description = "Retrieves an avatar for a user by their username.",
        security = @SecurityRequirement(name = "auth_token")
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Avatar retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "User not found"),
    })
    public ResponseEntity<Resource> getAvatar(@PathVariable String username) throws Exception {
        Resource resource = this.userService.getAvatar(username);
        return ResponseEntity.ok().contentType(MediaType.IMAGE_JPEG).body(resource);
    }

    @GetMapping("/{username}/invitations")
    @Operation(
        summary = "Get pending invitations",
        description = "Retrieves all pending collaboration invitations for a user.",
        security = @SecurityRequirement(name = "auth_token")
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Invitations retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "User not found")
    })
    public ResponseEntity<List<CollaboratorDTO>> getPendingInvitations(@PathVariable String username) {
        List<CollaboratorDTO> invitations = this.collaborationService.getPendingInvitations(username);
        return ResponseEntity.ok(invitations);
    }
}
