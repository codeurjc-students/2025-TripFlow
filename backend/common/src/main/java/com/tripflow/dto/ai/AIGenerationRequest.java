package com.tripflow.dto.ai;

import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record AIGenerationRequest(
    @Size(max = 2000, message = "AI prompt must not exceed 2000 characters")
    String aiPrompt,

    @NotBlank(message = "Destination is required")
    @Size(max = 200, message = "Destination must not exceed 200 characters")
    String destination,

    @Size(max = 100, message = "Style must not exceed 100 characters")
    String style,

    @Positive(message = "Budget must be a positive number")
    Double budget,

    @Size(max = 100, message = "Lodging must not exceed 100 characters")
    String lodging,

    @Size(max = 50, message = "Duration must not exceed 50 characters")
    String duration,

    @Size(max = 20, message = "Interests list must not exceed 20 items")
    List<String> interests
) {}