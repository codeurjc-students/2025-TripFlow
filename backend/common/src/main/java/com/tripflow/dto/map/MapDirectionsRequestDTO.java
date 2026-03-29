package com.tripflow.dto.map;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record MapDirectionsRequestDTO(
    @NotNull(message = "Profile is required")
    MapDirectionsProfileDTO profile,

    @NotEmpty(message = "At least two waypoints are required")
    @Size(min = 2, max = 25, message = "Waypoints must contain between 2 and 25 coordinates")
    @Valid
    List<MapCoordinateDTO> waypoints,

    boolean alternatives,

    boolean steps
) {}
