package com.tripflow.dto.stats;

import java.util.List;

public record UsersByPlanStatsDTO(
    List<UsersByPlanItemDTO> items
) {}
