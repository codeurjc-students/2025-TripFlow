package com.tripflow.service.map.provider.support;

import org.springframework.http.HttpStatus;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.server.ResponseStatusException;

public final class MapProviderExceptionMapper {

    private MapProviderExceptionMapper() {
    }

    public static ResponseStatusException fromHttpStatus(HttpStatusCodeException ex) {
        int status = ex.getStatusCode().value();
        if (status == 400) {
            return new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid map request parameters");
        }
        if (status == 401 || status == 403) {
            return new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Map provider authentication failed");
        }
        if (status == 404) {
            return new ResponseStatusException(HttpStatus.NOT_FOUND, "Map resource not found");
        }
        if (status == 429) {
            return new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "Map provider rate limit reached");
        }
        return new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Map provider is unavailable");
    }
}
