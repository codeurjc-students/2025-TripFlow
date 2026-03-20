package com.tripflow.kafka.messages;

import java.time.Instant;

public record CollaborationEventMessage(
    Long itineraryId,
    CollaborationEventType eventType,
    String actorUsername,
    String targetUsername,
    String role,
    Instant timestamp
) {
    public CollaborationEventMessage(
        Long itineraryId,
        CollaborationEventType eventType,
        String actorUsername,
        String targetUsername,
        String role
    ) {
        this(itineraryId, eventType, actorUsername, targetUsername, role, Instant.now());
    }
}
