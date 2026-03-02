package com.tripflow.dto.itinerary;

import java.util.List;

import com.tripflow.dto.externalImage.ExternalImageDTO;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public record ExtendedItineraryDTO(
    Long id,

    @NotBlank(message = "Title is required")
    @Size(max = 200, message = "Title must not exceed 200 characters")
    String title,

    @Size(max = 200, message = "Place must not exceed 200 characters")
    String place,

    @PositiveOrZero(message = "People count must be zero or positive")
    int people,

    @PositiveOrZero(message = "Budget must be zero or positive")
    double budget,

    @Size(max = 50, message = "Date must not exceed 50 characters")
    String date,

    @Size(max = 30, message = "Tags list must not exceed 30 items")
    List<String> tags,

    Long updatedCount,
    ItineraryStatusDTO status,

    @Valid
    List<ItineraryDayDTO> days,

    int countDays,
    ExternalImageDTO coverImage
) {}