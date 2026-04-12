package com.tripflow.unit;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import com.tripflow.dto.itinerary.ActivityDTO;
import com.tripflow.dto.itinerary.CoordinatesDTO;
import com.tripflow.dto.itinerary.ExtendedItineraryDTO;
import com.tripflow.dto.itinerary.ItineraryDayDTO;
import com.tripflow.dto.itinerary.ItineraryStatusDTO;
import com.tripflow.dto.itinerary.LocationDTO;
import com.tripflow.util.ItinerarySanitizer;

@Tag("unit")
public class ItinerarySanitizerTest {

    @Test
    @DisplayName("ItinerarySanitizer should apply tolerant defaults and drop invalid coordinates")
    public void testSanitizeExtendedItinerary() {
        ExtendedItineraryDTO raw = new ExtendedItineraryDTO(
            1L,
            "   ",
            null,
            -1,
            -99,
            null,
            java.util.Arrays.asList("  food ", "", null),
            0L,
            ItineraryStatusDTO.DRAFT,
            List.of(new ItineraryDayDTO(
                0,
                List.of(new ActivityDTO(
                    null,
                    null,
                    new LocationDTO(null, null, new CoordinatesDTO(91.0, -181.0)),
                    null,
                    null
                ))
            )),
            -5,
            null
        );

        ExtendedItineraryDTO sanitized = ItinerarySanitizer.sanitizeExtendedItinerary(raw);

        assertEquals("Itinerario", sanitized.title());
        assertEquals("Destino por definir", sanitized.place());
        assertEquals(0, sanitized.people());
        assertEquals(0, sanitized.budget());
        assertEquals(1, sanitized.days().get(0).day());
        assertEquals("Actividad", sanitized.days().get(0).activities().get(0).activity());
        assertEquals("", sanitized.days().get(0).activities().get(0).details());
        assertEquals("", sanitized.days().get(0).activities().get(0).time());
        assertEquals("", sanitized.days().get(0).activities().get(0).duration());
        assertEquals("Sin ubicacion", sanitized.days().get(0).activities().get(0).location().name());
        assertEquals("", sanitized.days().get(0).activities().get(0).location().address());
        assertNull(sanitized.days().get(0).activities().get(0).location().coordinates());
        assertEquals(List.of("food"), sanitized.tags());
    }
}
