package com.tripflow.service;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.tripflow.kafka.messages.ItineraryChangeMessage;

@Service
public class ItineraryChangeHandlerService {

    private final SimpMessagingTemplate messagingTemplate;

    public ItineraryChangeHandlerService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void handleChange(ItineraryChangeMessage message) {
        if (message.itineraryId() == null) {
            return;
        }

        String destination = "/topic/itineraries/" + message.itineraryId() + "/changes";
        messagingTemplate.convertAndSend(destination, message);
    }
}
