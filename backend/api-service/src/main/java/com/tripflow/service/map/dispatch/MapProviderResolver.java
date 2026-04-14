package com.tripflow.service.map.dispatch;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import com.tripflow.config.MapTilerProperties;
import com.tripflow.config.MapsProperties;
import com.tripflow.config.OpenRouteServiceProperties;

@Component
public class MapProviderResolver {

    public static final String PROVIDER_MAPTILER = "maptiler";
    public static final String PROVIDER_MOCK = "mock";

    private final MapsProperties mapsProperties;
    private final MapTilerProperties mapTilerProperties;
    private final OpenRouteServiceProperties openRouteServiceProperties;

    public MapProviderResolver(
        MapsProperties mapsProperties,
        MapTilerProperties mapTilerProperties,
        OpenRouteServiceProperties openRouteServiceProperties
    ) {
        this.mapsProperties = mapsProperties;
        this.mapTilerProperties = mapTilerProperties;
        this.openRouteServiceProperties = openRouteServiceProperties;
    }

    public String resolveSearchProvider() {
        this.ensureMapsEnabled();
        String provider = this.ensureSupportedProvider();

        if (PROVIDER_MAPTILER.equalsIgnoreCase(provider)
            && (this.mapTilerProperties.getApiKey() == null || this.mapTilerProperties.getApiKey().isBlank())) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Map provider key is not configured");
        }

        return provider;
    }

    public String resolveRoutingProvider() {
        this.ensureMapsEnabled();
        String provider = this.ensureSupportedProvider();

        if (PROVIDER_MAPTILER.equalsIgnoreCase(provider)
            && (this.openRouteServiceProperties.getApiKey() == null || this.openRouteServiceProperties.getApiKey().isBlank())) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Directions provider key is not configured");
        }

        return provider;
    }

    private void ensureMapsEnabled() {
        if (!this.mapsProperties.isEnabled()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Map service is disabled");
        }
    }

    private String ensureSupportedProvider() {
        String provider = this.mapsProperties.getProvider();
        if (PROVIDER_MOCK.equalsIgnoreCase(provider)) {
            return PROVIDER_MOCK;
        }

        if (!PROVIDER_MAPTILER.equalsIgnoreCase(provider)) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Unsupported map provider configured");
        }

        return PROVIDER_MAPTILER;
    }
}
