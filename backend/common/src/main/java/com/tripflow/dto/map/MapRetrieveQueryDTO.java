package com.tripflow.dto.map;

import jakarta.validation.constraints.Size;

public record MapRetrieveQueryDTO(
    @Size(max = 16, message = "Language must not exceed 16 characters")
    String language
) {}
