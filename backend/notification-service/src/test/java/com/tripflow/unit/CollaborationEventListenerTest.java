package com.tripflow.unit;

import static org.mockito.Mockito.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import com.tripflow.consumer.CollaborationEventListener;
import com.tripflow.kafka.messages.CollaborationEventMessage;
import com.tripflow.kafka.messages.CollaborationEventType;
import com.tripflow.service.CollaborationEventHandlerService;

@Tag("unit")
public class CollaborationEventListenerTest {

    private CollaborationEventHandlerService collaborationEventHandlerService;
    private CollaborationEventListener collaborationEventListener;

    @BeforeEach
    public void setUp() {
        this.collaborationEventHandlerService = mock(CollaborationEventHandlerService.class);
        this.collaborationEventListener = new CollaborationEventListener(collaborationEventHandlerService);
    }

    @Test
    @DisplayName("CollaborationEventListener should forward messages to handler")
    public void testConsume() {
        CollaborationEventMessage message = new CollaborationEventMessage(
            3L,
            CollaborationEventType.INVITE_ACCEPTED,
            "actor",
            "target",
            "VIEWER"
        );

        collaborationEventListener.consume(message);

        verify(collaborationEventHandlerService).handleEvent(message);
    }
}
