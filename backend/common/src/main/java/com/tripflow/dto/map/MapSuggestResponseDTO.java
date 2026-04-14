package com.tripflow.dto.map;

import java.util.List;

public record MapSuggestResponseDTO(
    List<MapSuggestionDTO> suggestions
) {}
