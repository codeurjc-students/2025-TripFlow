package com.tripflow.consumer;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import com.tripflow.kafka.messages.CollaborationEventMessage;
import com.tripflow.service.CollaborationEventHandlerService;

@Component
public class CollaborationEventListener {
    private final CollaborationEventHandlerService collaborationEventHandlerService;

    public CollaborationEventListener(CollaborationEventHandlerService collaborationEventHandlerService) {
        this.collaborationEventHandlerService = collaborationEventHandlerService;
    }

    @KafkaListener(
        topics = "collaboration",
        groupId = "collaboration-service",
        containerFactory = "collaborationFactory"
    )
    public void consume(CollaborationEventMessage message) {
        this.collaborationEventHandlerService.handleEvent(message);
    }
}
