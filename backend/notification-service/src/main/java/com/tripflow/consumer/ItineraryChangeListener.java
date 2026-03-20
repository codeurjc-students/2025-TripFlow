package com.tripflow.consumer;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import com.tripflow.kafka.messages.ItineraryChangeMessage;
import com.tripflow.service.ItineraryChangeHandlerService;

@Component
public class ItineraryChangeListener {
    private final ItineraryChangeHandlerService itineraryChangeHandlerService;

    public ItineraryChangeListener(ItineraryChangeHandlerService itineraryChangeHandlerService) {
        this.itineraryChangeHandlerService = itineraryChangeHandlerService;
    }

    @KafkaListener(
        topics = "itinerary-change",
        groupId = "itinerary-change-service",
        containerFactory = "itineraryChangeFactory"
    )
    public void consume(ItineraryChangeMessage message) {
        this.itineraryChangeHandlerService.handleChange(message);
    }
}
