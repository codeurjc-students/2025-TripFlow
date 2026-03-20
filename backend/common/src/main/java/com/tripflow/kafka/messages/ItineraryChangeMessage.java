package com.tripflow.kafka.messages;

import java.time.Instant;

public record ItineraryChangeMessage(
    Long itineraryId,
    ItineraryChangeType changeType,
    String actorUsername,
    Instant timestamp
) {
    public ItineraryChangeMessage(Long itineraryId, ItineraryChangeType changeType, String actorUsername) {
        this(itineraryId, changeType, actorUsername, Instant.now());
    }
}
