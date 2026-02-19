package com.tripflow.integration;

import static org.hamcrest.Matchers.*;

import java.util.List;

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
import com.tripflow.dto.itinerary.collaborator.RemoveCollaboratorRequest;
import com.tripflow.dto.itinerary.collaborator.UpdateCollaboratorRequest;
import com.tripflow.integration.utils.AuthTestUtils;

import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import io.restassured.response.Response;

@Tag("integration")
public class CollaborationEndpointsTest extends BaseIntegrationTest {

    @Test
    @DisplayName("Should add a collaborator successfully")
    public void testAddCollaborator() {
        String ownerName = "owner_" + System.currentTimeMillis();
        String ownerToken = AuthTestUtils.authenticateUserAndGetToken(ownerName, false);

        String collaboratorName = "collab_" + System.currentTimeMillis();
        AuthTestUtils.authenticateUserAndGetToken(collaboratorName, false);

        ExtendedItineraryDTO itineraryDTO = createTestItinerary();
        Response createResponse = RestAssured
            .given()
                .contentType(ContentType.JSON)
                .cookie("auth_token", ownerToken)
                .body(itineraryDTO)
            .when()
                .post("/v1/itineraries")
            .then()
                .statusCode(201)
                .extract()
                .response();
        
        Long itineraryId = createResponse.jsonPath().getLong("id");

        AddCollaboratorRequest request = new AddCollaboratorRequest(
            collaboratorName, CollaboratorRoleDTO.VIEWER
        );

        RestAssured
            .given()
                .contentType(ContentType.JSON)
                .cookie("auth_token", ownerToken)
                .body(request)
            .when()
                .post("/v1/itineraries/{id}/collaborators", itineraryId)
            .then()
                .statusCode(201)
                .body("user.username", equalTo(collaboratorName))
                .body("role", equalTo("VIEWER"));
    }

    @Test
    @DisplayName("Should update collaborator role")
    public void testUpdateCollaboratorRole() {
        String ownerName = "owner_upd_" + System.currentTimeMillis();
        String ownerToken = AuthTestUtils.authenticateUserAndGetToken(ownerName, false);

        String collaboratorName = "collab_upd_" + System.currentTimeMillis();
        AuthTestUtils.authenticateUserAndGetToken(collaboratorName, false);

        ExtendedItineraryDTO itineraryDTO = createTestItinerary();
        Response createResponse = RestAssured
            .given()
                .contentType(ContentType.JSON)
                .cookie("auth_token", ownerToken)
                .body(itineraryDTO)
            .when()
                .post("/v1/itineraries")
            .then()
                .statusCode(201)
                .extract()
                .response();
        
        Long itineraryId = createResponse.jsonPath().getLong("id");

        AddCollaboratorRequest addRequest = new AddCollaboratorRequest(
            collaboratorName, CollaboratorRoleDTO.VIEWER
        );

        RestAssured
            .given()
                .contentType(ContentType.JSON)
                .cookie("auth_token", ownerToken)
                .body(addRequest)
            .when()
                .post("/v1/itineraries/{id}/collaborators", itineraryId)
            .then()
                .statusCode(201);

        UpdateCollaboratorRequest updateRequest = new UpdateCollaboratorRequest(
            collaboratorName, CollaboratorRoleDTO.EDITOR
        );
        
        RestAssured
            .given()
                .contentType(ContentType.JSON)
                .cookie("auth_token", ownerToken)
                .body(updateRequest)
            .when()
                .put("/v1/itineraries/{id}/collaborators", itineraryId)
            .then()
                .statusCode(200)
                .body("role", equalTo("EDITOR"));
    }

    @Test
    @DisplayName("Should remove collaborator")
    public void testRemoveCollaborator() {
        String ownerName = "owner_rm_" + System.currentTimeMillis();
        String ownerToken = AuthTestUtils.authenticateUserAndGetToken(ownerName, false);

        String collaboratorName = "collab_rm_" + System.currentTimeMillis();
        AuthTestUtils.authenticateUserAndGetToken(collaboratorName, false);

        ExtendedItineraryDTO itineraryDTO = createTestItinerary();
        Response createResponse = RestAssured
            .given()
                .contentType(ContentType.JSON)
                .cookie("auth_token", ownerToken)
                .body(itineraryDTO)
            .when()
                .post("/v1/itineraries")
            .then()
                .statusCode(201)
                .extract()
                .response();
        
        Long itineraryId = createResponse.jsonPath().getLong("id");

        AddCollaboratorRequest addRequest = new AddCollaboratorRequest(
            collaboratorName, CollaboratorRoleDTO.VIEWER
        );

        RestAssured
            .given()
                .contentType(ContentType.JSON)
                .cookie("auth_token", ownerToken)
                .body(addRequest)
            .when()
                .post("/v1/itineraries/{id}/collaborators", itineraryId)
            .then()
                .statusCode(201);

        RemoveCollaboratorRequest removeRequest = new RemoveCollaboratorRequest(
            collaboratorName
        );
        
        RestAssured
            .given()
                .contentType(ContentType.JSON)
                .cookie("auth_token", ownerToken)
                .body(removeRequest)
            .when()
                .delete("/v1/itineraries/{id}/collaborators/{username}", itineraryId, collaboratorName)
            .then()
                .statusCode(204);
        
        RestAssured
            .given()
                .cookie("auth_token", ownerToken)
            .when()
                .get("/v1/itineraries/{id}/collaborators", itineraryId)
            .then()
                .statusCode(200)
                .body("size()", equalTo(0));
    }

    private ExtendedItineraryDTO createTestItinerary() {
        CoordinatesDTO coordinates = new CoordinatesDTO(48.8566, 2.3522);
        LocationDTO location = new LocationDTO("Eiffel Tower", "Paris, France", coordinates);
        ActivityDTO activity = new ActivityDTO("Visit Eiffel Tower", "Sightseeing", location, "09:00", "2h");
        ItineraryDayDTO day = new ItineraryDayDTO(1, List.of(activity));
        
        return new ExtendedItineraryDTO(
            null, "Paris Tests", "Paris",
            2, 1000.0, "2025-06-10", List.of(),
            0L, ItineraryStatusDTO.DRAFT, List.of(day), 1, null
        );
    }
}
