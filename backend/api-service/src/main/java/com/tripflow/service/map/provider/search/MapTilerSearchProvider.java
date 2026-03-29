package com.tripflow.service.map.provider.search;

import java.util.ArrayList;
import java.util.List;
import java.nio.charset.StandardCharsets;
import java.util.Locale;
import java.util.Objects;
import java.util.Set;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.util.UriComponentsBuilder;
import org.springframework.web.util.UriUtils;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tripflow.config.MapTilerProperties;
import com.tripflow.config.MapsProperties;
import com.tripflow.dto.map.MapCoordinateDTO;
import com.tripflow.dto.map.MapPlaceDTO;
import com.tripflow.dto.map.MapRetrieveQueryDTO;
import com.tripflow.dto.map.MapSuggestQueryDTO;
import com.tripflow.dto.map.MapSuggestResponseDTO;
import com.tripflow.dto.map.MapSuggestionDTO;
import com.tripflow.service.map.MapsCacheService;
import com.tripflow.service.map.MapsHttpClientFactory;
import com.tripflow.service.map.provider.support.MapProviderExceptionMapper;

@Service
public class MapTilerSearchProvider implements MapsSearchProvider {

    private static final String ENDPOINT_SUGGEST = "search_suggest";
    private static final String ENDPOINT_RETRIEVE = "search_retrieve";
    private static final double EARTH_RADIUS_KM = 6371.0;
    private static final int DEFAULT_RADIUS_KM = 5;
    private static final String DEFAULT_DISCOVERY_QUERY = "poi";
    private static final int DEFAULT_SUGGEST_LIMIT = 15;
    private static final Set<String> POI_FEATURE_TYPES = Set.of(
        "poi", "place", "restaurant", "cafe", "bar", "museum", "hotel", "attraction", "park", "shop"
    );

    private final RestTemplate mapsRestTemplate;
    private final ObjectMapper objectMapper;
    private final MapTilerProperties mapTilerProperties;
    private final MapsProperties mapsProperties;
    private final MapsCacheService mapsCacheService;

    public MapTilerSearchProvider(
        MapsHttpClientFactory mapsHttpClientFactory,
        ObjectMapper objectMapper,
        MapTilerProperties mapTilerProperties,
        MapsProperties mapsProperties,
        MapsCacheService mapsCacheService
    ) {
        this.mapsRestTemplate = mapsHttpClientFactory.createRestTemplate();
        this.objectMapper = objectMapper;
        this.mapTilerProperties = mapTilerProperties;
        this.mapsProperties = mapsProperties;
        this.mapsCacheService = mapsCacheService;
    }

    @Override
    public MapSuggestResponseDTO suggest(MapSuggestQueryDTO query) {
        SuggestRequestContext context = this.buildSuggestContext(query);
        String requestUrl = this.buildSuggestRequestUrl(query, context);
        String cacheKey = this.buildSuggestCacheKey(query, context);

        String payload = this.getCachedOrFetch(
            cacheKey,
            ENDPOINT_SUGGEST,
            requestUrl,
            this.mapsProperties.getSearchCacheTtlSeconds()
        );

        return this.parseSuggestResponse(payload, context);
    }

    @Override
    public MapPlaceDTO retrieve(String id, MapRetrieveQueryDTO query) {
        if (id == null || id.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "id is required");
        }

        String encodedId = UriUtils.encodePathSegment(id, StandardCharsets.UTF_8);

        UriComponentsBuilder requestBuilder = UriComponentsBuilder
            .fromUriString(this.mapTilerProperties.getGeocodingBaseUrl() + "/" + encodedId + ".json")
            .queryParam("key", this.mapTilerProperties.getApiKey());

        this.addQueryParamIfPresent(requestBuilder, "language", query.language());

        String requestUrl = requestBuilder.build().toUriString();

        String cacheKey = MapsCacheService.buildCacheKey(
            ENDPOINT_RETRIEVE + "|" + id + "|" + query.language()
        );

        String payload = this.getCachedOrFetch(
            cacheKey,
            ENDPOINT_RETRIEVE,
            requestUrl,
            this.mapsProperties.getSearchCacheTtlSeconds()
        );

        return this.parseRetrieveResponse(payload);
    }

    private String buildSuggestRequestUrl(MapSuggestQueryDTO query, SuggestRequestContext context) {
        UriComponentsBuilder requestBuilder = UriComponentsBuilder
            .fromUriString(this.mapTilerProperties.getGeocodingBaseUrl() + "/" + UriUtils.encodePathSegment(context.effectiveQuery(), StandardCharsets.UTF_8) + ".json")
            .queryParam("autocomplete", true)
            .queryParam("types", "poi")
            .queryParam("limit", query.limit() != null ? query.limit() : DEFAULT_SUGGEST_LIMIT)
            .queryParam("key", this.mapTilerProperties.getApiKey());

        this.addQueryParamIfPresent(requestBuilder, "language", query.language());
        this.addQueryParamIfPresent(requestBuilder, "proximity", context.proximity());
        this.addQueryParamIfPresent(requestBuilder, "bbox", context.bbox());
        this.addQueryParamIfPresent(requestBuilder, "country", query.country());

        return requestBuilder.build().toUriString();
    }

    private String buildSuggestCacheKey(MapSuggestQueryDTO query, SuggestRequestContext context) {
        String rawKey = ENDPOINT_SUGGEST
            + "|" + context.effectiveQuery()
            + "|" + query.language()
            + "|" + query.limit()
            + "|" + context.proximity()
            + "|" + context.bbox()
            + "|" + query.country()
            + "|" + query.category();
        return MapsCacheService.buildCacheKey(rawKey);
    }

    private MapSuggestResponseDTO parseSuggestResponse(String payload, SuggestRequestContext context) {
        try {
            JsonNode root = this.objectMapper.readTree(payload);
            JsonNode features = root.path("features");
            List<MapSuggestionDTO> suggestions = new ArrayList<>();
            if (features.isArray()) {
                for (JsonNode feature : features) {
                    MapSuggestionDTO suggestion = this.toSuggestion(feature);
                    if (this.isUsefulSuggestion(suggestion, context)) {
                        suggestions.add(suggestion);
                    }
                }
            }
            return new MapSuggestResponseDTO(suggestions);
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Invalid map provider response");
        }
    }

    private MapPlaceDTO parseRetrieveResponse(String payload) {
        try {
            JsonNode root = this.objectMapper.readTree(payload);
            JsonNode feature = root.path("features").path(0);
            if (feature.isMissingNode()) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Place not found");
            }

            JsonNode center = feature.path("center");
            double longitude = center.isArray() ? center.path(0).asDouble(Double.NaN) : Double.NaN;
            double latitude = center.isArray() ? center.path(1).asDouble(Double.NaN) : Double.NaN;

            if (Double.isNaN(latitude) || Double.isNaN(longitude)) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Map provider returned invalid coordinates");
            }

            return new MapPlaceDTO(
                feature.path("id").asText(null),
                feature.path("text").asText(null),
                feature.path("place_name").asText(null),
                feature.path("place_name").asText(null),
                firstText(feature.path("place_type")),
                new MapCoordinateDTO(latitude, longitude),
                this.extractCategories(feature)
            );
        } catch (ResponseStatusException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Invalid map provider response");
        }
    }

    private MapSuggestionDTO toSuggestion(JsonNode feature) {
        JsonNode center = feature.path("center");
        double longitude = center.isArray() ? center.path(0).asDouble(Double.NaN) : Double.NaN;
        double latitude = center.isArray() ? center.path(1).asDouble(Double.NaN) : Double.NaN;

        MapCoordinateDTO centerPoint = (!Double.isNaN(latitude) && !Double.isNaN(longitude))
            ? new MapCoordinateDTO(latitude, longitude)
            : null;

        return new MapSuggestionDTO(
            feature.path("id").asText(null),
            feature.path("text").asText(null),
            feature.path("place_name").asText(null),
            feature.path("place_name").asText(null),
            firstText(feature.path("place_type")),
            centerPoint,
            this.extractCategories(feature)
        );
    }

    private String getCachedOrFetch(String cacheKey, String endpoint, String requestUrl, long ttlSeconds) {
        return this.mapsCacheService.getValidPayload(cacheKey)
            .orElseGet(() -> {
                String payload = this.fetch(requestUrl);
                this.mapsCacheService.save(cacheKey, endpoint, payload, ttlSeconds);
                return payload;
            });
    }

    private String fetch(String requestUrl) {
        try {
            String response = this.mapsRestTemplate.getForObject(requestUrl, String.class);
            if (response == null || response.isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Map provider returned an empty response");
            }
            return response;
        } catch (HttpStatusCodeException ex) {
            throw MapProviderExceptionMapper.fromHttpStatus(ex);
        } catch (ResourceAccessException ex) {
            throw new ResponseStatusException(HttpStatus.GATEWAY_TIMEOUT, "Map provider request timed out");
        }
    }

    private String normalizeBlankToNull(String value) {
        return (value == null || value.isBlank()) ? null : value;
    }

    private SuggestRequestContext buildSuggestContext(MapSuggestQueryDTO query) {
        String effectiveQuery = this.buildEffectiveQuery(query);

        if (query.lat() == null || query.lon() == null) {
            return new SuggestRequestContext(
                effectiveQuery,
                this.normalizeBlankToNull(query.proximity()),
                this.normalizeBlankToNull(query.bbox())
            );
        }

        double lat = query.lat();
        double lon = query.lon();
        int radiusKm = query.radiusKm() != null ? query.radiusKm() : DEFAULT_RADIUS_KM;
        String proximity = String.format(Locale.US, "%s,%s", lon, lat);
        String bbox = this.buildBboxFromRadius(lat, lon, radiusKm);

        return new SuggestRequestContext(effectiveQuery, proximity, bbox);
    }

    private String buildBboxFromRadius(double lat, double lon, int radiusKm) {
        double latDelta = Math.toDegrees(radiusKm / EARTH_RADIUS_KM);
        double cosLat = Math.cos(Math.toRadians(lat));
        if (Math.abs(cosLat) < 1e-6) {
            cosLat = 1e-6;
        }
        double lonDelta = Math.toDegrees(radiusKm / (EARTH_RADIUS_KM * cosLat));

        double minLon = this.clamp(lon - lonDelta, -180d, 180d);
        double maxLon = this.clamp(lon + lonDelta, -180d, 180d);
        double minLat = this.clamp(lat - latDelta, -90d, 90d);
        double maxLat = this.clamp(lat + latDelta, -90d, 90d);

        return String.format(Locale.US, "%.6f,%.6f,%.6f,%.6f", minLon, minLat, maxLon, maxLat);
    }

    private String buildEffectiveQuery(MapSuggestQueryDTO query) {
        String baseQuery = this.normalizeBlankToNull(query.q());
        String category = this.normalizeBlankToNull(query.category());

        if (baseQuery == null && category == null) {
            return DEFAULT_DISCOVERY_QUERY;
        }

        if (baseQuery == null) {
            return category;
        }

        if (category == null) {
            return baseQuery;
        }

        return baseQuery + " " + category;
    }

    private double clamp(double value, double min, double max) {
        return Math.max(min, Math.min(max, value));
    }

    private boolean isUsefulSuggestion(MapSuggestionDTO suggestion, SuggestRequestContext context) {
        if (this.isBlank(suggestion.id()) || this.isBlank(suggestion.name()) || this.isBlank(suggestion.fullAddress())) {
            return false;
        }

        if ("-".equals(suggestion.name().trim()) || "-".equals(suggestion.fullAddress().trim())) {
            return false;
        }

        if (suggestion.center() == null) {
            return false;
        }

        if (!this.isPoiIntent(context)) {
            return true;
        }

        String featureType = this.normalize(suggestion.featureType());
        if (POI_FEATURE_TYPES.contains(featureType)) {
            return true;
        }

        return suggestion.categories() != null
            && suggestion.categories().stream()
            .filter(Objects::nonNull)
            .map(this::normalize)
            .anyMatch(category -> !category.isBlank() && !"address".equals(category) && !"street".equals(category));
    }

    private boolean isPoiIntent(SuggestRequestContext context) {
        return context.effectiveQuery() != null
            && context.effectiveQuery().toLowerCase(Locale.ROOT).contains(DEFAULT_DISCOVERY_QUERY);
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim().toLowerCase(Locale.ROOT);
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private record SuggestRequestContext(
        String effectiveQuery,
        String proximity,
        String bbox
    ) {
    }

    private void addQueryParamIfPresent(UriComponentsBuilder builder, String name, String value) {
        String normalized = this.normalizeBlankToNull(value);
        if (normalized != null) {
            builder.queryParam(name, normalized);
        }
    }

    private String firstText(JsonNode node) {
        if (node.isArray() && node.size() > 0 && node.path(0).isTextual()) {
            return node.path(0).asText();
        }
        if (node.isTextual()) {
            return node.asText();
        }
        return null;
    }

    private List<String> extractCategories(JsonNode feature) {
        List<String> categories = new ArrayList<>();

        JsonNode placeType = feature.path("place_type");
        if (placeType.isArray()) {
            for (JsonNode type : placeType) {
                if (type.isTextual()) {
                    categories.add(type.asText());
                }
            }
        }

        JsonNode properties = feature.path("properties");
        JsonNode category = properties.path("category");
        if (category.isTextual()) {
            categories.add(category.asText());
        }

        return categories.stream().filter(Objects::nonNull).distinct().toList();
    }
}
