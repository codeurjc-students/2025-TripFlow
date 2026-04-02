package com.tripflow.service.map.provider.support;

import org.springframework.http.HttpStatus;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.server.ResponseStatusException;

public final class MapProviderExceptionMapper {

    private MapProviderExceptionMapper() {
    }

    public static ResponseStatusException fromHttpStatus(HttpStatusCodeException ex) {
        int status = ex.getStatusCode().value();
        String providerMessage = extractProviderMessage(ex);
        if (status == 400) {
            return new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                providerMessage == null ? "Invalid map request parameters" : providerMessage
            );
        }
        if (status == 401 || status == 403) {
            return new ResponseStatusException(
                HttpStatus.SERVICE_UNAVAILABLE,
                providerMessage == null ? "Map provider authentication failed" : providerMessage
            );
        }
        if (status == 404) {
            return new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                providerMessage == null ? "Map resource not found" : providerMessage
            );
        }
        if (status == 429) {
            return new ResponseStatusException(
                HttpStatus.TOO_MANY_REQUESTS,
                providerMessage == null ? "Map provider rate limit reached" : providerMessage
            );
        }
        return new ResponseStatusException(
            HttpStatus.BAD_GATEWAY,
            providerMessage == null ? "Map provider is unavailable" : providerMessage
        );
    }

    private static String extractProviderMessage(HttpStatusCodeException ex) {
        String body = ex.getResponseBodyAsString();
        if (body == null || body.isBlank()) {
            return null;
        }

        String compactBody = body.replaceAll("\\s+", " ").trim();
        if (compactBody.length() <= 200) {
            return compactBody;
        }

        return compactBody.substring(0, 200) + "...";
    }
}
