package com.tripflow.service.map.provider.routing;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tripflow.config.MapsProperties;
import com.tripflow.config.OpenRouteServiceProperties;
import com.tripflow.dto.map.MapCoordinateDTO;
import com.tripflow.dto.map.MapDirectionsProfileDTO;
import com.tripflow.dto.map.MapDirectionsRequestDTO;
import com.tripflow.dto.map.MapDirectionsResponseDTO;
import com.tripflow.dto.map.MapRouteDTO;
import com.tripflow.dto.map.MapRouteLegDTO;
import com.tripflow.service.map.MapsCacheService;
import com.tripflow.service.map.MapsHttpClientFactory;
import com.tripflow.service.map.provider.support.DirectionsCacheKeyBuilder;
import com.tripflow.service.map.provider.support.MapProviderExceptionMapper;

@Service
public class OpenRouteServiceRoutingProvider implements MapsRoutingProvider {

    private static final String ENDPOINT_DIRECTIONS = "directions";
    private static final String PROFILE_DRIVING = "driving-car";
    private static final String PROFILE_WALKING = "foot-walking";
    private static final String PROFILE_CYCLING = "cycling-regular";

    private final RestTemplate mapsRestTemplate;
    private final ObjectMapper objectMapper;
    private final OpenRouteServiceProperties openRouteServiceProperties;
    private final MapsProperties mapsProperties;
    private final MapsCacheService mapsCacheService;

    public OpenRouteServiceRoutingProvider(
        MapsHttpClientFactory mapsHttpClientFactory,
        ObjectMapper objectMapper,
        OpenRouteServiceProperties openRouteServiceProperties,
        MapsProperties mapsProperties,
        MapsCacheService mapsCacheService
    ) {
        this.mapsRestTemplate = mapsHttpClientFactory.createRestTemplate();
        this.objectMapper = objectMapper;
        this.openRouteServiceProperties = openRouteServiceProperties;
        this.mapsProperties = mapsProperties;
        this.mapsCacheService = mapsCacheService;
    }

    @Override
    public MapDirectionsResponseDTO directions(MapDirectionsRequestDTO request) {
        String profile = this.toOrsProfile(request.profile());
        String requestUrl = this.openRouteServiceProperties.getDirectionsBaseUrl() + "/" + profile + "/geojson";
        String requestBody = this.buildRequestBody(request);

        String cacheKey = this.buildDirectionsCacheKey(request);

        String payload = this.mapsCacheService.getValidPayload(cacheKey)
            .orElseGet(() -> {
                String responsePayload = this.fetch(requestUrl, requestBody);
                this.mapsCacheService.save(
                    cacheKey,
                    ENDPOINT_DIRECTIONS,
                    responsePayload,
                    this.mapsProperties.getDirectionsCacheTtlSeconds()
                );
                return responsePayload;
            });

        return this.parseDirectionsResponse(payload);
    }

    private String buildDirectionsCacheKey(MapDirectionsRequestDTO request) {
        String rawKey = DirectionsCacheKeyBuilder.buildRawKey(request);
        return MapsCacheService.buildCacheKey(rawKey);
    }

    private MapDirectionsResponseDTO parseDirectionsResponse(String payload) {
        try {
            JsonNode root = this.objectMapper.readTree(payload);
            JsonNode features = root.path("features");
            List<MapRouteDTO> routes = new ArrayList<>();

            if (features.isArray()) {
                for (JsonNode feature : features) {
                    routes.add(this.toRoute(feature));
                }
            }

            return new MapDirectionsResponseDTO(routes);
        } catch (ResponseStatusException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Invalid map provider response");
        }
    }

    private MapRouteDTO toRoute(JsonNode featureNode) {
        JsonNode properties = featureNode.path("properties");
        JsonNode summary = properties.path("summary");

        return new MapRouteDTO(
            summary.path("distance").asDouble(0),
            summary.path("duration").asDouble(0),
            this.toGeometry(featureNode.path("geometry").path("coordinates")),
            this.toLegs(properties.path("segments"))
        );
    }

    private List<MapCoordinateDTO> toGeometry(JsonNode coordinatesNode) {
        List<MapCoordinateDTO> geometry = new ArrayList<>();
        if (!coordinatesNode.isArray()) {
            return geometry;
        }

        for (JsonNode point : coordinatesNode) {
            if (!point.isArray() || point.size() < 2) {
                continue;
            }
            double longitude = point.path(0).asDouble(Double.NaN);
            double latitude = point.path(1).asDouble(Double.NaN);
            if (!Double.isNaN(latitude) && !Double.isNaN(longitude)) {
                geometry.add(new MapCoordinateDTO(latitude, longitude));
            }
        }
        return geometry;
    }

    private List<MapRouteLegDTO> toLegs(JsonNode segmentsNode) {
        List<MapRouteLegDTO> legs = new ArrayList<>();
        if (!segmentsNode.isArray()) {
            return legs;
        }

        for (JsonNode segmentNode : segmentsNode) {
            String summary = this.resolveLegSummary(segmentNode.path("steps"));
            legs.add(new MapRouteLegDTO(
                segmentNode.path("distance").asDouble(0),
                segmentNode.path("duration").asDouble(0),
                summary
            ));
        }
        return legs;
    }

    private String resolveLegSummary(JsonNode stepsNode) {
        if (!stepsNode.isArray() || stepsNode.size() == 0) {
            return "";
        }
        return stepsNode.path(0).path("instruction").asText("");
    }

    private String fetch(String requestUrl, String requestBody) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("application/json; charset=utf-8"));
            headers.set(
                HttpHeaders.ACCEPT,
                "application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8"
            );
            headers.set(HttpHeaders.AUTHORIZATION, this.openRouteServiceProperties.getApiKey());

            HttpEntity<String> requestEntity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<String> response = this.mapsRestTemplate.exchange(
                requestUrl,
                HttpMethod.POST,
                requestEntity,
                String.class
            );

            String responseBody = response.getBody();
            if (responseBody == null || responseBody.isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Map provider returned an empty response");
            }

            return responseBody;
        } catch (HttpStatusCodeException ex) {
            throw MapProviderExceptionMapper.fromHttpStatus(ex);
        } catch (ResourceAccessException ex) {
            throw new ResponseStatusException(HttpStatus.GATEWAY_TIMEOUT, "Map provider request timed out");
        }
    }

    private String buildRequestBody(MapDirectionsRequestDTO request) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("coordinates", this.toCoordinates(request.waypoints()));
        payload.put("instructions", request.steps());
        payload.put("geometry", true);

        if (request.alternatives()) {
            Map<String, Object> alternatives = new LinkedHashMap<>();
            alternatives.put("target_count", 2);
            payload.put("alternative_routes", alternatives);
        }

        try {
            return this.objectMapper.writeValueAsString(payload);
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid map request payload");
        }
    }

    private List<List<Double>> toCoordinates(List<MapCoordinateDTO> waypoints) {
        List<List<Double>> coordinates = new ArrayList<>();
        for (MapCoordinateDTO waypoint : waypoints) {
            coordinates.add(List.of(waypoint.longitude(), waypoint.latitude()));
        }
        return coordinates;
    }

    private String toOrsProfile(MapDirectionsProfileDTO profile) {
        return switch (profile) {
            case WALKING -> PROFILE_WALKING;
            case CYCLING -> PROFILE_CYCLING;
            default -> PROFILE_DRIVING;
        };
    }
}
