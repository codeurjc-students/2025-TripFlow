package com.tripflow.dto.map;

import java.util.List;

public record MapRouteDTO(
    double distance,
    double duration,
    List<MapCoordinateDTO> geometry,
    List<MapRouteLegDTO> legs
) {}
