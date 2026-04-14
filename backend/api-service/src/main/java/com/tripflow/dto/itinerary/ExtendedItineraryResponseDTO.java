package com.tripflow.dto.itinerary;

import com.fasterxml.jackson.annotation.JsonUnwrapped;

public record ExtendedItineraryResponseDTO(
    @JsonUnwrapped
    ExtendedItineraryDTO itinerary,
    PermissionsDTO permissions
) {}
