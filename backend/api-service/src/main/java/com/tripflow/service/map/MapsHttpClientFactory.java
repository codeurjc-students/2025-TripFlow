package com.tripflow.service.map;

import java.time.Duration;

import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import com.tripflow.config.MapsProperties;

@Component
public class MapsHttpClientFactory {

    private final RestTemplateBuilder restTemplateBuilder;
    private final MapsProperties mapsProperties;

    public MapsHttpClientFactory(RestTemplateBuilder restTemplateBuilder, MapsProperties mapsProperties) {
        this.restTemplateBuilder = restTemplateBuilder;
        this.mapsProperties = mapsProperties;
    }

    public RestTemplate createRestTemplate() {
        Duration timeout = Duration.ofMillis(this.mapsProperties.getTimeoutMs());
        return this.restTemplateBuilder
            .connectTimeout(timeout)
            .readTimeout(timeout)
            .build();
    }
}
