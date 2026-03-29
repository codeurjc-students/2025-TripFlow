package com.tripflow.dto.map;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record MapSuggestQueryDTO(
    @Size(max = 256, message = "Search query must not exceed 256 characters")
    String q,

    @Size(max = 16, message = "Language must not exceed 16 characters")
    String language,

    @Min(value = 1, message = "Limit must be greater than or equal to 1")
    @Max(value = 10, message = "Limit must be less than or equal to 10")
    Integer limit,

    @Pattern(
        regexp = "^$|^(-?\\d{1,3}(?:\\.\\d+)?),(-?\\d{1,2}(?:\\.\\d+)?)$",
        message = "Proximity must follow 'longitude,latitude'"
    )
    String proximity,

    @Pattern(
        regexp = "^$|^(-?\\d{1,3}(?:\\.\\d+)?),(-?\\d{1,2}(?:\\.\\d+)?),(-?\\d{1,3}(?:\\.\\d+)?),(-?\\d{1,2}(?:\\.\\d+)?)$",
        message = "Bbox must follow 'minLon,minLat,maxLon,maxLat'"
    )
    String bbox,

    @Size(max = 32, message = "Country filter must not exceed 32 characters")
    String country,

    @Min(value = -90, message = "Latitude must be greater than or equal to -90")
    @Max(value = 90, message = "Latitude must be less than or equal to 90")
    Double lat,

    @Min(value = -180, message = "Longitude must be greater than or equal to -180")
    @Max(value = 180, message = "Longitude must be less than or equal to 180")
    Double lon,

    @Min(value = 5, message = "radiusKm must be between 5 and 50")
    @Max(value = 50, message = "radiusKm must be between 5 and 50")
    Integer radiusKm,

    @Size(max = 64, message = "category must not exceed 64 characters")
    String category
) {

    @AssertTrue(message = "lat and lon must be provided together")
    public boolean hasValidCoordinatePair() {
        return (this.lat == null) == (this.lon == null);
    }

    @AssertTrue(message = "radiusKm requires lat and lon")
    public boolean hasValidRadiusDependencies() {
        return this.radiusKm == null || (this.lat != null && this.lon != null);
    }

    @AssertTrue(message = "q is required when lat/lon are not provided")
    public boolean hasQueryOrCoordinates() {
        return hasText(this.q) || (this.lat != null && this.lon != null);
    }

    private boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }
}
