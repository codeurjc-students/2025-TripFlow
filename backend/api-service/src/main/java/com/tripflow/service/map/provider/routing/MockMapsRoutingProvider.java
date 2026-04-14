package com.tripflow.service.map.provider.routing;

import java.util.List;

import org.springframework.stereotype.Service;

import com.tripflow.dto.map.MapCoordinateDTO;
import com.tripflow.dto.map.MapDirectionsRequestDTO;
import com.tripflow.dto.map.MapDirectionsResponseDTO;
import com.tripflow.dto.map.MapRouteDTO;
import com.tripflow.dto.map.MapRouteLegDTO;

@Service
public class MockMapsRoutingProvider implements MapsRoutingProvider {

    @Override
    public MapDirectionsResponseDTO directions(MapDirectionsRequestDTO request) {
        List<MapCoordinateDTO> geometry = request.waypoints();

        return new MapDirectionsResponseDTO(List.of(
            new MapRouteDTO(
                1200.0,
                780.0,
                geometry,
                List.of(new MapRouteLegDTO(1200.0, 780.0, "Gran Via"))
            )
        ));
    }
}
