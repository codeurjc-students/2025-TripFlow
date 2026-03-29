package com.tripflow.unit;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;

import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import com.tripflow.dto.map.MapCoordinateDTO;
import com.tripflow.dto.map.MapDirectionsProfileDTO;
import com.tripflow.dto.map.MapDirectionsRequestDTO;
import com.tripflow.service.map.provider.support.DirectionsCacheKeyBuilder;

@Tag("unit")
public class DirectionsCacheKeyBuilderTest {

    @Test
    @DisplayName("buildRawKey should normalize tiny coordinate precision differences")
    public void testBuildRawKeyNormalizesCoordinates() {
        MapDirectionsRequestDTO requestA = request(
            MapDirectionsProfileDTO.DRIVING,
            List.of(
                new MapCoordinateDTO(40.4168004, -3.7038004),
                new MapCoordinateDTO(40.4138004, -3.6921004)
            ),
            false,
            false
        );

        MapDirectionsRequestDTO requestB = request(
            MapDirectionsProfileDTO.DRIVING,
            List.of(
                new MapCoordinateDTO(40.41680049, -3.70380049),
                new MapCoordinateDTO(40.41380049, -3.69210049)
            ),
            false,
            false
        );

        assertEquals(
            DirectionsCacheKeyBuilder.buildRawKey(requestA),
            DirectionsCacheKeyBuilder.buildRawKey(requestB)
        );
    }

    @Test
    @DisplayName("buildRawKey should change when waypoint order changes")
    public void testBuildRawKeyChangesWithWaypointOrder() {
        MapCoordinateDTO a = new MapCoordinateDTO(40.4168, -3.7038);
        MapCoordinateDTO b = new MapCoordinateDTO(40.4138, -3.6921);

        String keyForward = DirectionsCacheKeyBuilder.buildRawKey(
            request(MapDirectionsProfileDTO.DRIVING, List.of(a, b), false, false)
        );
        String keyReverse = DirectionsCacheKeyBuilder.buildRawKey(
            request(MapDirectionsProfileDTO.DRIVING, List.of(b, a), false, false)
        );

        assertNotEquals(keyForward, keyReverse);
    }

    @Test
    @DisplayName("buildRawKey should change when profile or options change")
    public void testBuildRawKeyChangesWithRoutingOptions() {
        List<MapCoordinateDTO> waypoints = List.of(
            new MapCoordinateDTO(40.4168, -3.7038),
            new MapCoordinateDTO(40.4138, -3.6921)
        );

        String baseKey = DirectionsCacheKeyBuilder.buildRawKey(
            request(MapDirectionsProfileDTO.DRIVING, waypoints, false, false)
        );
        String walkingKey = DirectionsCacheKeyBuilder.buildRawKey(
            request(MapDirectionsProfileDTO.WALKING, waypoints, false, false)
        );
        String alternativesKey = DirectionsCacheKeyBuilder.buildRawKey(
            request(MapDirectionsProfileDTO.DRIVING, waypoints, true, false)
        );
        String stepsKey = DirectionsCacheKeyBuilder.buildRawKey(
            request(MapDirectionsProfileDTO.DRIVING, waypoints, false, true)
        );

        assertNotEquals(baseKey, walkingKey);
        assertNotEquals(baseKey, alternativesKey);
        assertNotEquals(baseKey, stepsKey);
    }

    private MapDirectionsRequestDTO request(
        MapDirectionsProfileDTO profile,
        List<MapCoordinateDTO> waypoints,
        boolean alternatives,
        boolean steps
    ) {
        return new MapDirectionsRequestDTO(profile, waypoints, alternatives, steps);
    }
}
