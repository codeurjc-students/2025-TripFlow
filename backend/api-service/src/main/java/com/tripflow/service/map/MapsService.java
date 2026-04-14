package com.tripflow.service.map;

import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.tripflow.dto.map.MapDirectionsRequestDTO;
import com.tripflow.dto.map.MapDirectionsResponseDTO;
import com.tripflow.dto.map.MapPlaceDTO;
import com.tripflow.dto.map.MapRetrieveQueryDTO;
import com.tripflow.dto.map.MapSuggestQueryDTO;
import com.tripflow.dto.map.MapSuggestResponseDTO;
import com.tripflow.service.map.dispatch.MapProviderResolver;
import com.tripflow.service.map.provider.routing.MapsRoutingProvider;
import com.tripflow.service.map.provider.routing.MockMapsRoutingProvider;
import com.tripflow.service.map.provider.routing.OpenRouteServiceRoutingProvider;
import com.tripflow.service.map.provider.search.MapsSearchProvider;
import com.tripflow.service.map.provider.search.MapTilerSearchProvider;
import com.tripflow.service.map.provider.search.MockMapsSearchProvider;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;

@Service
public class MapsService {

    private final MapProviderResolver mapProviderResolver;
    private final MapTilerSearchProvider mapTilerSearchProvider;
    private final OpenRouteServiceRoutingProvider openRouteServiceRoutingProvider;
    private final MockMapsSearchProvider mockMapsSearchProvider;
    private final MockMapsRoutingProvider mockMapsRoutingProvider;
    private final Validator validator;

    public MapsService(
        MapProviderResolver mapProviderResolver,
        MapTilerSearchProvider mapTilerSearchProvider,
        OpenRouteServiceRoutingProvider openRouteServiceRoutingProvider,
        MockMapsSearchProvider mockMapsSearchProvider,
        MockMapsRoutingProvider mockMapsRoutingProvider,
        Validator validator
    ) {
        this.mapProviderResolver = mapProviderResolver;
        this.mapTilerSearchProvider = mapTilerSearchProvider;
        this.openRouteServiceRoutingProvider = openRouteServiceRoutingProvider;
        this.mockMapsSearchProvider = mockMapsSearchProvider;
        this.mockMapsRoutingProvider = mockMapsRoutingProvider;
        this.validator = validator;
    }

    public MapSuggestResponseDTO suggest(MapSuggestQueryDTO query) {
        String provider = this.mapProviderResolver.resolveSearchProvider();
        this.validate(query);
        return this.resolveSearchProvider(provider).suggest(query);
    }

    public MapPlaceDTO retrieve(String id, MapRetrieveQueryDTO query) {
        String provider = this.mapProviderResolver.resolveSearchProvider();
        this.validate(query);
        return this.resolveSearchProvider(provider).retrieve(id, query);
    }

    public MapDirectionsResponseDTO directions(MapDirectionsRequestDTO request) {
        String provider = this.mapProviderResolver.resolveRoutingProvider();
        this.validate(request);
        return this.resolveRoutingProvider(provider).directions(request);
    }

    private MapsSearchProvider resolveSearchProvider(String provider) {
        return MapProviderResolver.PROVIDER_MOCK.equalsIgnoreCase(provider)
            ? this.mockMapsSearchProvider
            : this.mapTilerSearchProvider;
    }

    private MapsRoutingProvider resolveRoutingProvider(String provider) {
        return MapProviderResolver.PROVIDER_MOCK.equalsIgnoreCase(provider)
            ? this.mockMapsRoutingProvider
            : this.openRouteServiceRoutingProvider;
    }

    private <T> void validate(T dto) {
        Set<ConstraintViolation<T>> violations = this.validator.validate(dto);
        if (!violations.isEmpty()) {
            String message = violations.stream()
                .map(ConstraintViolation::getMessage)
                .sorted()
                .collect(Collectors.joining(", "));
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
        }
    }
}
