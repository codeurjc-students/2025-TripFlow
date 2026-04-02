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
        String baseUrl = this.directionsBaseUrl == null ? "" : this.directionsBaseUrl.trim();
        if (baseUrl.endsWith("/")) {
            baseUrl = baseUrl.substring(0, baseUrl.length() - 1);
        }

        if (baseUrl.endsWith("/directions")) {
            return baseUrl;
        }

        return baseUrl + "/directions";
    }
}
