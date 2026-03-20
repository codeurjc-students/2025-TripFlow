package com.tripflow.unit;

import static org.mockito.Mockito.*;

import java.time.Instant;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import com.tripflow.kafka.messages.ItineraryChangeMessage;
import com.tripflow.kafka.messages.ItineraryChangeType;
import com.tripflow.service.ItineraryChangeHandlerService;

@Tag("unit")
public class ItineraryChangeHandlerServiceTest {

    private SimpMessagingTemplate messagingTemplate;
    private ItineraryChangeHandlerService itineraryChangeHandlerService;

    @BeforeEach
    public void setUp() {
        this.messagingTemplate = mock(SimpMessagingTemplate.class);
        this.itineraryChangeHandlerService = new ItineraryChangeHandlerService(messagingTemplate);
    }

    @Test
    @DisplayName("ItineraryChangeHandlerService should broadcast change events")
    public void testHandleChangeBroadcasts() {
        ItineraryChangeMessage message = new ItineraryChangeMessage(
            5L,
            ItineraryChangeType.UPDATED,
            "actor",
            Instant.now()
        );

        itineraryChangeHandlerService.handleChange(message);

        verify(messagingTemplate).convertAndSend(
            eq("/topic/itineraries/5/changes"),
            eq(message)
        );
    }

    @Test
    @DisplayName("ItineraryChangeHandlerService should ignore null itineraryId")
    public void testHandleChangeIgnoresNullItineraryId() {
        ItineraryChangeMessage message = new ItineraryChangeMessage(
            null,
            ItineraryChangeType.UPDATED,
            "actor",
            Instant.now()
        );

        itineraryChangeHandlerService.handleChange(message);

        verifyNoInteractions(messagingTemplate);
    }
}
