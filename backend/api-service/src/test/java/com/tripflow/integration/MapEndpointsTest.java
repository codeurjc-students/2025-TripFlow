package com.tripflow.integration;

import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.hasSize;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import com.tripflow.integration.utils.AuthTestUtils;

import io.restassured.RestAssured;
import io.restassured.http.ContentType;

@Tag("integration")
public class MapEndpointsTest extends BaseIntegrationTest {

    private static final String AUTH_COOKIE = "auth_token";
    private static final String SUGGEST_ENDPOINT = "/v1/maps/search/suggest";
    private static final String RETRIEVE_ENDPOINT = "/v1/maps/search/retrieve/{id}";
    private static final String DIRECTIONS_ENDPOINT = "/v1/maps/directions";

    private static final String DEFAULT_DIRECTIONS_BODY = """
        {
          "profile": "DRIVING",
          "waypoints": [
            {"latitude": 40.4168, "longitude": -3.7038},
            {"latitude": 40.4138, "longitude": -3.6921}
          ],
          "alternatives": false,
          "steps": false
        }
        """;

    @Test
    @DisplayName("Suggest endpoint requires authentication")
    public void testSuggestUnauthorized() {
        RestAssured
            .given()
                .param("q", "prado")
            .when()
                .get(SUGGEST_ENDPOINT)
            .then()
                .statusCode(401);
    }

    @Test
    @DisplayName("Retrieve endpoint requires authentication")
    public void testRetrieveUnauthorized() {
        RestAssured
            .when()
                .get(RETRIEVE_ENDPOINT, "mock-place-id")
            .then()
                .statusCode(401);
    }

    @Test
    @DisplayName("Directions endpoint requires authentication")
    public void testDirectionsUnauthorized() {
        RestAssured
            .given()
                .contentType(ContentType.JSON)
                .body(DEFAULT_DIRECTIONS_BODY)
            .when()
                .post(DIRECTIONS_ENDPOINT)
            .then()
                .statusCode(401);
    }

    @Test
    @DisplayName("Suggest endpoint returns suggestions for authenticated user")
    public void testSuggestSuccess() {
        String authToken = AuthTestUtils.authenticateUserAndGetToken("map_user");

        RestAssured
            .given()
                .cookie(AUTH_COOKIE, authToken)
                .param("q", "prado")
            .when()
                .get(SUGGEST_ENDPOINT)
            .then()
                .statusCode(200)
                .body("suggestions", hasSize(1))
                .body("suggestions[0].name", equalTo("Museo del Prado"));
    }

    @Test
    @DisplayName("Retrieve endpoint returns place for authenticated user")
    public void testRetrieveSuccess() {
        String authToken = AuthTestUtils.authenticateUserAndGetToken("map_retrieve_user");

        RestAssured
            .given()
                .cookie(AUTH_COOKIE, authToken)
            .when()
                .get(RETRIEVE_ENDPOINT, "mock-place-id")
            .then()
                .statusCode(200)
                .body("id", equalTo("mock-place-id"))
                .body("center.latitude", equalTo(40.4138f));
    }

    @Test
    @DisplayName("Directions endpoint returns route for authenticated user")
    public void testDirectionsSuccess() {
        String authToken = AuthTestUtils.authenticateUserAndGetToken("map_directions_user");

        RestAssured
            .given()
                .cookie(AUTH_COOKIE, authToken)
                .contentType(ContentType.JSON)
                .body(DEFAULT_DIRECTIONS_BODY)
            .when()
                .post(DIRECTIONS_ENDPOINT)
            .then()
                .statusCode(200)
                .body("routes", hasSize(1))
                .body("routes[0].geometry", hasSize(2));
    }

    @Test
    @DisplayName("Suggest endpoint validates coordinate pair")
    public void testSuggestBadRequestWhenOnlyLatProvided() {
        String authToken = AuthTestUtils.authenticateUserAndGetToken("map_suggest_bad_request_user");

        RestAssured
            .given()
                .cookie(AUTH_COOKIE, authToken)
                .param("lat", 40.4168)
            .when()
                .get(SUGGEST_ENDPOINT)
            .then()
                .statusCode(400);
    }

    @Test
    @DisplayName("Directions endpoint validates waypoint count")
    public void testDirectionsBadRequestWhenWaypointCountIsInvalid() {
        String authToken = AuthTestUtils.authenticateUserAndGetToken("map_directions_bad_request_user");

        String invalidDirectionsBody = """
            {
              "profile": "DRIVING",
              "waypoints": [
                {"latitude": 40.4168, "longitude": -3.7038}
              ],
              "alternatives": false,
              "steps": false
            }
            """;

        RestAssured
            .given()
                .cookie(AUTH_COOKIE, authToken)
                .contentType(ContentType.JSON)
                .body(invalidDirectionsBody)
            .when()
                .post(DIRECTIONS_ENDPOINT)
            .then()
                .statusCode(400);
    }
}
