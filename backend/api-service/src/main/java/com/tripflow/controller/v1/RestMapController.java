package com.tripflow.controller.v1;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.tripflow.dto.map.MapDirectionsRequestDTO;
import com.tripflow.dto.map.MapDirectionsResponseDTO;
import com.tripflow.dto.map.MapPlaceDTO;
import com.tripflow.dto.map.MapRetrieveQueryDTO;
import com.tripflow.dto.map.MapSuggestQueryDTO;
import com.tripflow.dto.map.MapSuggestResponseDTO;
import com.tripflow.service.map.MapsService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@Validated
@RequestMapping("/api/v1/maps")
@Tag(name = "Map Integration", description = "Map search and directions proxy endpoints")
public class RestMapController {
    private final MapsService mapsService;

    public RestMapController(MapsService mapsService) {
        this.mapsService = mapsService;
    }

    @GetMapping("/search/suggest")
    @Operation(
        summary = "Suggest places",
        description = "Returns autocomplete location suggestions through backend map proxy.",
        security = @SecurityRequirement(name = "auth_token")
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Suggestions retrieved successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid query parameters"),
        @ApiResponse(responseCode = "401", description = "Unauthorized access"),
        @ApiResponse(responseCode = "503", description = "Map service unavailable")
    })
    public ResponseEntity<MapSuggestResponseDTO> suggest(
        @RequestParam(required = false) String q,
        @RequestParam(required = false) String language,
        @RequestParam(required = false) Integer limit,
        @RequestParam(required = false) String proximity,
        @RequestParam(required = false) String bbox,
        @RequestParam(required = false) String country,
        @RequestParam(required = false) Double lat,
        @RequestParam(required = false) Double lon,
        @RequestParam(required = false) Integer radiusKm,
        @RequestParam(required = false) String category
    ) {
        return ResponseEntity.ok(this.mapsService.suggest(
            new MapSuggestQueryDTO(q, language, limit, proximity, bbox, country, lat, lon, radiusKm, category)
        ));
    }

    @GetMapping("/search/retrieve/{id}")
    @Operation(
        summary = "Retrieve place details",
        description = "Returns place details and coordinates from selected suggestion.",
        security = @SecurityRequirement(name = "auth_token")
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Place details retrieved successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid query parameters"),
        @ApiResponse(responseCode = "401", description = "Unauthorized access"),
        @ApiResponse(responseCode = "404", description = "Place not found")
    })
    public ResponseEntity<MapPlaceDTO> retrieve(
        @PathVariable String id,
        @RequestParam(required = false) String language
    ) {
        return ResponseEntity.ok(this.mapsService.retrieve(id, new MapRetrieveQueryDTO(language)));
    }

    @PostMapping("/directions")
    @Operation(
        summary = "Get route directions",
        description = "Returns optimized route geometry and summary from ordered waypoints.",
        security = @SecurityRequirement(name = "auth_token")
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Directions retrieved successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid request payload"),
        @ApiResponse(responseCode = "401", description = "Unauthorized access"),
        @ApiResponse(responseCode = "503", description = "Map service unavailable")
    })
    public ResponseEntity<MapDirectionsResponseDTO> directions(
        @Valid @RequestBody MapDirectionsRequestDTO request
    ) {
        return ResponseEntity.ok(this.mapsService.directions(request));
    }
}
