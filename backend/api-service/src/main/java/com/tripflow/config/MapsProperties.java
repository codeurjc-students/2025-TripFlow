package com.tripflow.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class MapsProperties {

    @Value("${maps.enabled:false}")
    private boolean enabled;

    @Value("${maps.provider:maptiler}")
    private String provider;

    @Value("${maps.timeout.ms:5000}")
    private long timeoutMs;

    @Value("${maps.cache.ttl-seconds.search:300}")
    private long searchCacheTtlSeconds;

    @Value("${maps.cache.ttl-seconds.directions:300}")
    private long directionsCacheTtlSeconds;

    public boolean isEnabled() {
        return this.enabled;
    }

    public String getProvider() {
        return this.provider;
    }

    public long getTimeoutMs() {
        return this.timeoutMs;
    }

    public long getSearchCacheTtlSeconds() {
        return this.searchCacheTtlSeconds;
    }

    public long getDirectionsCacheTtlSeconds() {
        return this.directionsCacheTtlSeconds;
    }
}
