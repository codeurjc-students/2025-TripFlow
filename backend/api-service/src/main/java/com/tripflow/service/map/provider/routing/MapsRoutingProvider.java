package com.tripflow.service.map.provider.routing;

import com.tripflow.dto.map.MapDirectionsRequestDTO;
import com.tripflow.dto.map.MapDirectionsResponseDTO;

public interface MapsRoutingProvider {
    MapDirectionsResponseDTO directions(MapDirectionsRequestDTO request);
}
