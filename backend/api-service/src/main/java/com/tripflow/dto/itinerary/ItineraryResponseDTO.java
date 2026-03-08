package com.tripflow.dto.itinerary;

import com.fasterxml.jackson.annotation.JsonUnwrapped;

public record ItineraryResponseDTO(
    @JsonUnwrapped
    ItineraryDTO itinerary,
    PermissionsDTO permissions
) {}
