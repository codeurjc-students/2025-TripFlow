package com.tripflow.integration;

import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.greaterThan;
import static org.hamcrest.Matchers.notNullValue;

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
import com.tripflow.integration.utils.AuthTestUtils;

import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import io.restassured.response.Response;

@Tag("integration")
public class ShareLinkEndpointsTest extends BaseIntegrationTest {

    @Test
    @DisplayName("Should generate a share link as owner (201)")
    public void testGenerateShareLinkAsOwner() {
        String[] owner = createUserWithToken("o_sg");
        Long itineraryId = createItineraryAndGetId(owner[1]);

        RestAssured
            .given()
                .cookie("auth_token", owner[1])
            .when()
                .post("/v1/itineraries/{id}/share-links", itineraryId)
            .then()
                .statusCode(201)
                .body("id", notNullValue())
                .body("token", notNullValue())
                .body("token.length()", greaterThan(20))
                .body("expiresAt", notNullValue())
                .body("active", equalTo(true));
    }

    @Test
    @DisplayName("Should fail to generate share link as non-owner (403)")
    public void testGenerateShareLinkForbiddenForCollaborator() {
        String[] owner = createUserWithToken("o_sf");
        String[] collaborator = createUserWithToken("c_sf");
        Long itineraryId = createItineraryAndGetId(owner[1]);

        sendInvitation(owner[1], itineraryId, collaborator[0], CollaboratorRoleDTO.VIEWER);
        acceptInvitation(collaborator[1], itineraryId, collaborator[0]);

        RestAssured
            .given()
                .cookie("auth_token", collaborator[1])
            .when()
                .post("/v1/itineraries/{id}/share-links", itineraryId)
            .then()
                .statusCode(403);
    }

    @Test
    @DisplayName("Owner and accepted collaborator can list active share links (200)")
    public void testListShareLinksOwnerAndCollaboratorCanView() {
        String[] owner = createUserWithToken("o_sl");
        String[] collaborator = createUserWithToken("c_sl");
        Long itineraryId = createItineraryAndGetId(owner[1]);

        sendInvitation(owner[1], itineraryId, collaborator[0], CollaboratorRoleDTO.VIEWER);
        acceptInvitation(collaborator[1], itineraryId, collaborator[0]);

        RestAssured
            .given()
                .cookie("auth_token", owner[1])
            .when()
                .post("/v1/itineraries/{id}/share-links", itineraryId)
            .then()
                .statusCode(201);

        RestAssured
            .given()
                .cookie("auth_token", owner[1])
            .when()
                .get("/v1/itineraries/{id}/share-links", itineraryId)
            .then()
                .statusCode(200)
                .body("size()", equalTo(1));

        RestAssured
            .given()
                .cookie("auth_token", collaborator[1])
            .when()
                .get("/v1/itineraries/{id}/share-links", itineraryId)
            .then()
                .statusCode(200)
                .body("size()", equalTo(1));
    }

    @Test
    @DisplayName("Should get shared itinerary through public token and then deny access after revoke")
    public void testPublicAccessAndRevocationLifecycle() {
        String[] owner = createUserWithToken("o_sp");
        Long itineraryId = createItineraryAndGetId(owner[1]);

        Response created = RestAssured
            .given()
                .cookie("auth_token", owner[1])
            .when()
                .post("/v1/itineraries/{id}/share-links", itineraryId)
            .then()
                .statusCode(201)
                .extract()
                .response();

        Long shareLinkId = created.jsonPath().getLong("id");
        String token = created.jsonPath().getString("token");

        RestAssured
            .given()
            .when()
                .get("/v1/share/{token}", token)
            .then()
                .statusCode(200)
                .body("id", equalTo(itineraryId.intValue()))
                .body("permissions.view", equalTo(true))
                .body("permissions.edit", equalTo(false))
                .body("permissions.delete", equalTo(false));

        RestAssured
            .given()
                .cookie("auth_token", owner[1])
            .when()
                .delete("/v1/itineraries/{id}/share-links/{shareLinkId}", itineraryId, shareLinkId)
            .then()
                .statusCode(204);

        RestAssured
            .given()
            .when()
                .get("/v1/share/{token}", token)
            .then()
                .statusCode(403);
    }

    @Test
    @DisplayName("Should return 404 when shared token does not exist")
    public void testPublicTokenNotFound() {
        RestAssured
            .given()
            .when()
                .get("/v1/share/{token}", "missing_token_test")
            .then()
                .statusCode(404);
    }

    private String[] createUserWithToken(String prefix) {
        String name = AuthTestUtils.generateUniqueValue(prefix);
        String token = AuthTestUtils.authenticateUserAndGetToken(name, false);
        return new String[] { name, token };
    }

    private void sendInvitation(String ownerToken, Long itineraryId, String collaboratorName, CollaboratorRoleDTO role) {
        RestAssured
            .given()
                .contentType(ContentType.JSON)
                .cookie("auth_token", ownerToken)
                .body(new AddCollaboratorRequest(collaboratorName, role))
            .when()
                .post("/v1/itineraries/{id}/collaborators", itineraryId)
            .then()
                .statusCode(201);
    }

    private void acceptInvitation(String collaboratorToken, Long itineraryId, String collaboratorName) {
        RestAssured
            .given()
                .contentType(ContentType.JSON)
                .cookie("auth_token", collaboratorToken)
            .when()
                .put("/v1/itineraries/{id}/collaborators/{username}/accept", itineraryId, collaboratorName)
            .then()
                .statusCode(200);
    }

    private Long createItineraryAndGetId(String ownerToken) {
        CoordinatesDTO coordinates = new CoordinatesDTO(48.8566, 2.3522);
        LocationDTO location = new LocationDTO("Eiffel Tower", "Paris, France", coordinates);
        ActivityDTO activity = new ActivityDTO("Visit Eiffel Tower", "Sightseeing", location, "09:00", "2h");
        ItineraryDayDTO day = new ItineraryDayDTO(1, List.of(activity));

        ExtendedItineraryDTO itineraryDTO = new ExtendedItineraryDTO(
            null, "Paris Tests", "Paris",
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
                .jsonPath().getLong("id");
    }
}
