package com.tripflow.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class MapTilerProperties {

    @Value("${maptiler.api.key:}")
    private String apiKey;

    @Value("${maptiler.api.base-url.geocoding:https://api.maptiler.com/geocoding}")
    private String geocodingBaseUrl;

    @Value("${maptiler.api.base-url.static:https://api.maptiler.com/maps}")
    private String staticBaseUrl;

    public String getApiKey() {
        return this.apiKey;
    }

    public String getGeocodingBaseUrl() {
        return this.geocodingBaseUrl;
    }

    public String getStaticBaseUrl() {
        return this.staticBaseUrl;
    }
}
