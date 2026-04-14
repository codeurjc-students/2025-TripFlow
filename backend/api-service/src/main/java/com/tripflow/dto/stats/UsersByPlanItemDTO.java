package com.tripflow.dto.stats;

public record UsersByPlanItemDTO(
    String plan,
    Long count
) {}
