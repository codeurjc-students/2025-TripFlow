package com.tripflow.dto.map;

import java.util.List;

public record MapPlaceDTO(
    String id,
    String name,
    String fullAddress,
    String placeFormatted,
    String featureType,
    MapCoordinateDTO center,
    List<String> categories
) {}
