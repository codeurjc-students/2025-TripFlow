package com.tripflow.integration;

import static org.junit.jupiter.api.Assertions.*;

import java.time.Duration;
import java.util.List;

import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import com.tripflow.dto.itinerary.ActivityDTO;
import com.tripflow.dto.itinerary.CoordinatesDTO;
import com.tripflow.dto.itinerary.ExtendedItineraryDTO;
import com.tripflow.dto.itinerary.ItineraryDayDTO;
import com.tripflow.dto.itinerary.ItineraryStatusDTO;
import com.tripflow.dto.itinerary.LocationDTO;
import com.tripflow.dto.itinerary.collaborator.AddCollaboratorRequest;
import com.tripflow.dto.itinerary.collaborator.CollaboratorRoleDTO;
import com.tripflow.integration.utils.AuthTestUtils;
import com.tripflow.integration.utils.KafkaTestUtils;
import com.tripflow.kafka.messages.CollaborationEventMessage;
import com.tripflow.kafka.messages.CollaborationEventType;
import com.tripflow.kafka.messages.ItineraryChangeMessage;
import com.tripflow.kafka.messages.ItineraryChangeType;

import io.restassured.RestAssured;
import io.restassured.http.ContentType;

@Tag("integration")
public class KafkaEventsIntegrationTest extends BaseIntegrationTest {

    @Test
    @DisplayName("Itinerary update should emit itinerary-change event")
    public void testItineraryUpdateEmitsEvent() {
        String username = AuthTestUtils.generateUniqueValue("owner_evt");
        String authToken = AuthTestUtils.authenticateUserAndGetToken(username, false);
        Long itineraryId = createItineraryAndGetId(authToken);

        KafkaConsumer<String, ItineraryChangeMessage> consumer = KafkaTestUtils.createConsumer(
            kafka.getBootstrapServers(),
            "itinerary-change",
            ItineraryChangeMessage.class
        );

        ExtendedItineraryDTO updated = createUpdatePayload(itineraryId, "Rome Trip");
        RestAssured
            .given()
                .contentType(ContentType.JSON)
                .cookie("auth_token", authToken)
                .body(updated)
            .when()
                .put("/v1/itineraries/{id}", itineraryId)
            .then()
                .statusCode(200);

        ItineraryChangeMessage message = KafkaTestUtils.pollForMessage(
            consumer,
            event -> itineraryId.equals(event.itineraryId())
                && event.changeType() == ItineraryChangeType.UPDATED,
            Duration.ofSeconds(5)
        );
        consumer.close();

        assertNotNull(message);
        assertEquals(itineraryId, message.itineraryId());
        assertEquals(ItineraryChangeType.UPDATED, message.changeType());
        assertEquals(username, message.actorUsername());
    }

    @Test
    @DisplayName("Invitation should emit collaboration event")
    public void testInvitationEmitsCollaborationEvent() {
        String ownerName = AuthTestUtils.generateUniqueValue("owner_col");
        String collaboratorName = AuthTestUtils.generateUniqueValue("collab_col");
        String ownerToken = AuthTestUtils.authenticateUserAndGetToken(ownerName, false);
        AuthTestUtils.authenticateUserAndGetToken(collaboratorName, false);

        Long itineraryId = createItineraryAndGetId(ownerToken);

        KafkaConsumer<String, CollaborationEventMessage> consumer = KafkaTestUtils.createConsumer(
            kafka.getBootstrapServers(),
            "collaboration",
            CollaborationEventMessage.class
        );

        RestAssured
            .given()
                .contentType(ContentType.JSON)
                .cookie("auth_token", ownerToken)
                .body(new AddCollaboratorRequest(collaboratorName, CollaboratorRoleDTO.VIEWER))
            .when()
                .post("/v1/itineraries/{id}/collaborators", itineraryId)
            .then()
                .statusCode(201);

        CollaborationEventMessage message = KafkaTestUtils.pollForMessage(
            consumer,
            event -> itineraryId.equals(event.itineraryId())
                && event.eventType() == CollaborationEventType.INVITE_SENT,
            Duration.ofSeconds(5)
        );
        consumer.close();

        assertNotNull(message);
        assertEquals(itineraryId, message.itineraryId());
        assertEquals(CollaborationEventType.INVITE_SENT, message.eventType());
        assertEquals(ownerName, message.actorUsername());
        assertEquals(collaboratorName, message.targetUsername());
        assertEquals("VIEWER", message.role());
    }

    private Long createItineraryAndGetId(String ownerToken) {
        CoordinatesDTO coordinates = new CoordinatesDTO(48.8566, 2.3522);
        LocationDTO location = new LocationDTO("Eiffel Tower", "Paris, France", coordinates);
        ActivityDTO activity = new ActivityDTO("Visit Eiffel Tower", "Sightseeing", location, "09:00", "2h");
        ItineraryDayDTO day = new ItineraryDayDTO(1, List.of(activity));

        ExtendedItineraryDTO itineraryDTO = new ExtendedItineraryDTO(
            null, "Kafka Trip", "Paris",
            2, 1000.0, "2025-06-10", List.of(),
            0L, ItineraryStatusDTO.DRAFT, List.of(day), 1, null
        );

        return RestAssured
            .given()
                .contentType(ContentType.JSON)
                .cookie("auth_token", ownerToken)
                .body(itineraryDTO)
            .when()
                .post("/v1/itineraries")
            .then()
                .statusCode(201)
                .extract()
                .jsonPath()
                .getLong("id");
    }

    private ExtendedItineraryDTO createUpdatePayload(Long itineraryId, String title) {
        CoordinatesDTO coordinates = new CoordinatesDTO(41.9028, 12.4964);
        LocationDTO location = new LocationDTO("Colosseum", "Rome, Italy", coordinates);
        ActivityDTO activity = new ActivityDTO("Visit Colosseum", "Sightseeing", location, "10:00", "2h");
        ItineraryDayDTO day = new ItineraryDayDTO(1, List.of(activity));

        return new ExtendedItineraryDTO(
            itineraryId,
            title,
            "Rome",
            2,
            1500.0,
            "2025-06-10",
            List.of("history"),
            1L,
            ItineraryStatusDTO.DRAFT,
            List.of(day),
            1,
            null
        );
    }
}
