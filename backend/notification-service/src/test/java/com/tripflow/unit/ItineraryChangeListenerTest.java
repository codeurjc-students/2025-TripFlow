package com.tripflow.unit;

import static org.mockito.Mockito.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import com.tripflow.consumer.ItineraryChangeListener;
import com.tripflow.kafka.messages.ItineraryChangeMessage;
import com.tripflow.kafka.messages.ItineraryChangeType;
import com.tripflow.service.ItineraryChangeHandlerService;

@Tag("unit")
public class ItineraryChangeListenerTest {

    private ItineraryChangeHandlerService itineraryChangeHandlerService;
    private ItineraryChangeListener itineraryChangeListener;

    @BeforeEach
    public void setUp() {
        this.itineraryChangeHandlerService = mock(ItineraryChangeHandlerService.class);
        this.itineraryChangeListener = new ItineraryChangeListener(itineraryChangeHandlerService);
    }

    @Test
    @DisplayName("ItineraryChangeListener should forward messages to handler")
    public void testConsume() {
        ItineraryChangeMessage message = new ItineraryChangeMessage(
            10L,
            ItineraryChangeType.UPDATED,
            "actor"
        );

        itineraryChangeListener.consume(message);

        verify(itineraryChangeHandlerService).handleChange(message);
    }
}
