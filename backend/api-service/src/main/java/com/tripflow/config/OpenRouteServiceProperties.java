package com.tripflow.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class OpenRouteServiceProperties {

    @Value("${openrouteservice.api.key:}")
    private String apiKey;

    @Value("${openrouteservice.api.base-url:https://api.openrouteservice.org/v2/directions}")
    private String directionsBaseUrl;

    public String getApiKey() {
        return this.apiKey;
    }

    public String getDirectionsBaseUrl() {
        return this.directionsBaseUrl;
    }
}
