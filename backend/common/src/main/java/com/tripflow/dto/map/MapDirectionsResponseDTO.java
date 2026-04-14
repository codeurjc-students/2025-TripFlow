package com.tripflow.dto.map;

import java.util.List;

public record MapDirectionsResponseDTO(
    List<MapRouteDTO> routes
) {}
