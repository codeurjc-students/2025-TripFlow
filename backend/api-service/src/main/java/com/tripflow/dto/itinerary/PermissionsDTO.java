package com.tripflow.dto.itinerary;

public record PermissionsDTO(
    boolean view,
    boolean edit,
    boolean delete
) {}
