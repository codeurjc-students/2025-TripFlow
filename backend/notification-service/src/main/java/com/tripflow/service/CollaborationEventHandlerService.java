package com.tripflow.service;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.tripflow.kafka.messages.CollaborationEventMessage;

@Service
public class CollaborationEventHandlerService {

    private final SimpMessagingTemplate messagingTemplate;

    public CollaborationEventHandlerService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void handleEvent(CollaborationEventMessage message) {
        if (message.itineraryId() == null) {
            return;
        }

        String destination = "/topic/itineraries/" + message.itineraryId() + "/collaboration";
        messagingTemplate.convertAndSend(destination, message);
    }
}
