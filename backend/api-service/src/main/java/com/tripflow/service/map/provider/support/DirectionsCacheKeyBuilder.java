package com.tripflow.service.map.provider.support;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.StringJoiner;

import com.tripflow.dto.map.MapCoordinateDTO;
import com.tripflow.dto.map.MapDirectionsRequestDTO;

public final class DirectionsCacheKeyBuilder {

    private static final String CACHE_KEY_VERSION = "directions:v1";
    private static final int COORDINATE_SCALE = 6;

    private DirectionsCacheKeyBuilder() {
    }

    public static String buildRawKey(MapDirectionsRequestDTO request) {
        StringJoiner waypointJoiner = new StringJoiner(";");
        for (MapCoordinateDTO waypoint : request.waypoints()) {
            waypointJoiner.add(
                normalizeCoordinate(waypoint.latitude()) + "," + normalizeCoordinate(waypoint.longitude())
            );
        }

        return CACHE_KEY_VERSION
            + "|profile=" + request.profile().name()
            + "|alternatives=" + request.alternatives()
            + "|steps=" + request.steps()
            + "|waypoints=" + waypointJoiner;
    }

    private static String normalizeCoordinate(Double value) {
        return BigDecimal.valueOf(value)
            .setScale(COORDINATE_SCALE, RoundingMode.HALF_UP)
            .toPlainString();
    }
}
