package com.tripflow.controller.v1;

import java.net.URI;

import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.tripflow.dto.itinerary.ExtendedItineraryDTO;
import com.tripflow.dto.itinerary.ItineraryDTO;
import com.tripflow.dto.shared.PaginatedDTO;
import com.tripflow.service.itinerary.ItineraryService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/v1/itineraries")
@Tag(name = "Itinerary Management", description = "Endpoints for managing itineraries")
public class RestItineraryController {
    private final ItineraryService itineraryService;

    public RestItineraryController(ItineraryService itineraryService) {
        this.itineraryService = itineraryService;
    }

    @PostMapping({"", "/"})
    @Operation(
        summary = "Create Itinerary",
        description = "Creates a new itinerary for the authenticated user.",
        security = @SecurityRequirement(name = "auth_token")
    )
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Itinerary created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid itinerary data provided"),
        @ApiResponse(responseCode = "401", description = "Unauthorized access")
    })
    public ResponseEntity<ExtendedItineraryDTO> createItinerary(@Valid @RequestBody ExtendedItineraryDTO itineraryDTO) throws Exception {
        ExtendedItineraryDTO createdItinerary = this.itineraryService.createItinerary(itineraryDTO);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
            .buildAndExpand(createdItinerary.id()).toUri();

        return ResponseEntity.created(location).body(createdItinerary);
    }

    @GetMapping({"", "/"})
    @Operation(
        summary = "Get All Itineraries",
        description = "Retrieves a paginated list of itineraries for the authenticated user.",
        security = @SecurityRequirement(name = "auth_token")
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Itineraries retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized access"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<PaginatedDTO<ItineraryDTO>> getAllItineraries(
        @PageableDefault(page = 0, size = 10) Pageable pageable,
        @RequestParam(required = false) String search
    ) throws Exception {
        PaginatedDTO<ItineraryDTO> itineraries = this.itineraryService.getAllItineraries(pageable, search);
        return ResponseEntity.ok(itineraries);
    }

    @GetMapping("/{id}")
    @Operation(
        summary = "Get Itinerary by ID",
        description = "Retrieves the details of a specific itinerary by its ID for the authenticated user.",
        security = @SecurityRequirement(name = "auth_token")
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Itinerary retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized access"),
        @ApiResponse(responseCode = "404", description = "Itinerary not found"),
        @ApiResponse(responseCode = "403", description = "Access to the itinerary is forbidden"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<ExtendedItineraryDTO> getItineraryById(@PathVariable Long id) throws Exception {
        ExtendedItineraryDTO itinerary = this.itineraryService.getItineraryById(id);
        return ResponseEntity.ok(itinerary);
    }

    @PutMapping("/{id}")
    @Operation(
        summary = "Update Itinerary",
        description = "Updates an existing itinerary for the authenticated user.",
        security = @SecurityRequirement(name = "auth_token")
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Itinerary updated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid itinerary data provided"),
        @ApiResponse(responseCode = "401", description = "Unauthorized access"),
        @ApiResponse(responseCode = "404", description = "Itinerary not found"),
        @ApiResponse(responseCode = "403", description = "Access to the itinerary is forbidden"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<ExtendedItineraryDTO> updateItinerary(
        @PathVariable Long id, @Valid @RequestBody ExtendedItineraryDTO itineraryDTO
    ) throws Exception {
        ExtendedItineraryDTO updatedItinerary = this.itineraryService.updateItinerary(id, itineraryDTO);

        return ResponseEntity.ok(updatedItinerary);
    }

    @DeleteMapping("/{id}")
    @Operation(
        summary = "Delete Itinerary",
        description = "Deletes an existing itinerary for the authenticated user.",
        security = @SecurityRequirement(name = "auth_token")
    )
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "Itinerary deleted successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized access"),
        @ApiResponse(responseCode = "404", description = "Itinerary not found"),
        @ApiResponse(responseCode = "403", description = "Access to the itinerary is forbidden"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<Void> deleteItinerary(@PathVariable Long id) throws Exception {
        this.itineraryService.deleteItinerary(id);
        return ResponseEntity.noContent().build();
    }
}