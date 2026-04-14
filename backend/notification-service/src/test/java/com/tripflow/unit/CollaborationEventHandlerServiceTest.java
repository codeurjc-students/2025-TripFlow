package com.tripflow.unit;

import static org.mockito.Mockito.*;

import java.time.Instant;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import com.tripflow.kafka.messages.CollaborationEventMessage;
import com.tripflow.kafka.messages.CollaborationEventType;
import com.tripflow.service.CollaborationEventHandlerService;

@Tag("unit")
public class CollaborationEventHandlerServiceTest {

    private SimpMessagingTemplate messagingTemplate;
    private CollaborationEventHandlerService collaborationEventHandlerService;

    @BeforeEach
    public void setUp() {
        this.messagingTemplate = mock(SimpMessagingTemplate.class);
        this.collaborationEventHandlerService = new CollaborationEventHandlerService(messagingTemplate);
    }

    @Test
    @DisplayName("CollaborationEventHandlerService should broadcast collaboration events")
    public void testHandleEventBroadcasts() {
        CollaborationEventMessage message = new CollaborationEventMessage(
            7L,
            CollaborationEventType.ROLE_UPDATED,
            "actor",
            "target",
            "EDITOR",
            Instant.now()
        );

        collaborationEventHandlerService.handleEvent(message);

        verify(messagingTemplate).convertAndSend(
            eq("/topic/itineraries/7/collaboration"),
            eq(message)
        );
    }

    @Test
    @DisplayName("CollaborationEventHandlerService should ignore null itineraryId")
    public void testHandleEventIgnoresNullItineraryId() {
        CollaborationEventMessage message = new CollaborationEventMessage(
            null,
            CollaborationEventType.INVITE_SENT,
            "actor",
            "target",
            "VIEWER",
            Instant.now()
        );

        collaborationEventHandlerService.handleEvent(message);

        verifyNoInteractions(messagingTemplate);
    }
}
