package com.tripflow.util;

import java.util.ArrayList;
import java.util.List;

import com.tripflow.dto.itinerary.ActivityDTO;
import com.tripflow.dto.itinerary.CoordinatesDTO;
import com.tripflow.dto.itinerary.ExtendedItineraryDTO;
import com.tripflow.dto.itinerary.ItineraryDayDTO;
import com.tripflow.dto.itinerary.LocationDTO;

public final class ItinerarySanitizer {
    private static final String DEFAULT_TITLE = "Itinerario";
    private static final String DEFAULT_PLACE = "Destino por definir";
    private static final String DEFAULT_ACTIVITY = "Actividad";
    private static final String DEFAULT_LOCATION = "Sin ubicacion";

    private ItinerarySanitizer() {
    }

    public static ExtendedItineraryDTO sanitizeExtendedItinerary(ExtendedItineraryDTO itinerary) {
        if (itinerary == null) {
            return null;
        }

        return new ExtendedItineraryDTO(
            itinerary.id(),
            normalizeText(itinerary.title(), DEFAULT_TITLE),
            normalizeText(itinerary.place(), DEFAULT_PLACE),
            Math.max(itinerary.people(), 0),
            Math.max(itinerary.budget(), 0),
            normalizeText(itinerary.date(), ""),
            sanitizeTags(itinerary.tags()),
            itinerary.updatedCount(),
            itinerary.status(),
            sanitizeDays(itinerary.days()),
            Math.max(itinerary.countDays(), 0),
            itinerary.coverImage()
        );
    }

    private static List<String> sanitizeTags(List<String> tags) {
        if (tags == null || tags.isEmpty()) {
            return List.of();
        }

        List<String> sanitized = new ArrayList<>();
        for (String tag : tags) {
            String normalized = normalizeText(tag, "");
            if (!normalized.isEmpty()) {
                sanitized.add(normalized);
            }
        }

        return sanitized;
    }

    private static List<ItineraryDayDTO> sanitizeDays(List<ItineraryDayDTO> days) {
        if (days == null || days.isEmpty()) {
            return List.of();
        }

        List<ItineraryDayDTO> sanitized = new ArrayList<>();
        int fallbackDayNumber = 1;
        for (ItineraryDayDTO day : days) {
            int dayNumber = day == null || day.day() <= 0 ? fallbackDayNumber : day.day();
            List<ActivityDTO> activities = day == null ? List.of() : sanitizeActivities(day.activities());
            sanitized.add(new ItineraryDayDTO(dayNumber, activities));
            fallbackDayNumber += 1;
        }

        return sanitized;
    }

    private static List<ActivityDTO> sanitizeActivities(List<ActivityDTO> activities) {
        if (activities == null || activities.isEmpty()) {
            return List.of();
        }

        List<ActivityDTO> sanitized = new ArrayList<>();
        for (ActivityDTO activity : activities) {
            if (activity == null) {
                sanitized.add(new ActivityDTO(
                    DEFAULT_ACTIVITY,
                    "",
                    new LocationDTO(DEFAULT_LOCATION, "", null),
                    "",
                    ""
                ));
                continue;
            }

            sanitized.add(new ActivityDTO(
                normalizeText(activity.activity(), DEFAULT_ACTIVITY),
                normalizeText(activity.details(), ""),
                sanitizeLocation(activity.location()),
                normalizeText(activity.time(), ""),
                normalizeText(activity.duration(), "")
            ));
        }

        return sanitized;
    }

    private static LocationDTO sanitizeLocation(LocationDTO location) {
        if (location == null) {
            return new LocationDTO(DEFAULT_LOCATION, "", null);
        }

        return new LocationDTO(
            normalizeText(location.name(), DEFAULT_LOCATION),
            normalizeText(location.address(), ""),
            sanitizeCoordinates(location.coordinates())
        );
    }

    private static CoordinatesDTO sanitizeCoordinates(CoordinatesDTO coordinates) {
        if (coordinates == null || coordinates.latitude() == null || coordinates.longitude() == null) {
            return null;
        }

        double latitude = coordinates.latitude();
        double longitude = coordinates.longitude();
        if (!Double.isFinite(latitude) || !Double.isFinite(longitude)) {
            return null;
        }
        if (latitude < -90.0 || latitude > 90.0 || longitude < -180.0 || longitude > 180.0) {
            return null;
        }

        return new CoordinatesDTO(latitude, longitude);
    }

    private static String normalizeText(String value, String fallback) {
        if (value == null) {
            return fallback;
        }

        String trimmed = value.trim();
        return trimmed.isEmpty() ? fallback : trimmed;
    }
}
