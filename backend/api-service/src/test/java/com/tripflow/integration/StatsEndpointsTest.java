package com.tripflow.integration;

import org.junit.jupiter.api.Test;
import org.hamcrest.Matchers;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;

import com.tripflow.dto.itinerary.ActivityDTO;
import com.tripflow.dto.itinerary.CoordinatesDTO;
import com.tripflow.dto.itinerary.ExtendedItineraryDTO;
import com.tripflow.dto.itinerary.ItineraryDayDTO;
import com.tripflow.dto.itinerary.ItineraryStatusDTO;
import com.tripflow.dto.itinerary.LocationDTO;
import com.tripflow.dto.auth.LoginRequest;
import com.tripflow.integration.utils.AuthTestUtils;

import io.restassured.RestAssured;
import io.restassured.http.ContentType;

import java.util.List;

@Tag("integration")
public class StatsEndpointsTest extends BaseIntegrationTest {
    
    @Test
    @DisplayName("Test get user stats successfully")
    public void testGetUserStatsSuccessfully() {
        String authToken = AuthTestUtils.authenticateUserAndGetToken("user");

        RestAssured
        .given()
            .cookie("auth_token", authToken)
        .when()
            .get("/v1/stats/user")
        .then()
            .statusCode(200)
            .contentType(ContentType.JSON)
            .body("stats.size()", Matchers.is(3))
            .body("stats[0].key", Matchers.is("activities"))
            .body("stats[1].key", Matchers.is("places_visited"))
            .body("stats[2].key", Matchers.is("total_days"));
    }

    @Test
    @DisplayName("Test get user stats without authentication")
    public void testGetUserStatsWithInvalidToken() {
        RestAssured
        .given()
        .when()
            .get("/v1/stats/user")
        .then()
            .statusCode(401)
            .body("message", Matchers.is("Full authentication is required to access this resource"))
            .body("status", Matchers.is(401))
            .body("error", Matchers.is("Unauthorized"));
    }

    @Test
    @DisplayName("Test stats are zero for new user")
    public void testStatsAreZeroForNewUser() {
        String authToken = AuthTestUtils.authenticateUserAndGetToken("newuser");

        RestAssured
        .given()
            .cookie("auth_token", authToken)
        .when()
            .get("/v1/stats/user")
        .then()
            .statusCode(200)
            .body("stats[0].value", Matchers.is(0))
            .body("stats[1].value", Matchers.is(0))
            .body("stats[2].value", Matchers.is(0));
    }

    @Test
    @DisplayName("Test stats update after creating itinerary")
    public void testStatsUpdateAfterCreatingItinerary() {
        String authToken = AuthTestUtils.authenticateUserAndGetToken("statsuser");

        // Verify initial stats are zero
        RestAssured
        .given()
            .cookie("auth_token", authToken)
        .when()
            .get("/v1/stats/user")
        .then()
            .statusCode(200)
            .body("stats[0].value", Matchers.is(0))
            .body("stats[1].value", Matchers.is(0))
            .body("stats[2].value", Matchers.is(0));

        // Create itinerary with 2 days and 2 activities
        ExtendedItineraryDTO itinerary = createTestItinerary();
        
        RestAssured
        .given()
            .contentType(ContentType.JSON)
            .cookie("auth_token", authToken)
            .body(itinerary)
        .when()
            .post("/v1/itineraries")
        .then()
            .statusCode(201);

        // Verify stats are updated
        RestAssured
        .given()
            .cookie("auth_token", authToken)
        .when()
            .get("/v1/stats/user")
        .then()
            .statusCode(200)
            .body("stats[0].value", Matchers.greaterThan(0))
            .body("stats[1].value", Matchers.greaterThan(0))
            .body("stats[2].value", Matchers.greaterThan(0));
    }

    @Test
    @DisplayName("Test stats count distinct places")
    public void testStatsCountDistinctPlaces() {
        String authToken = AuthTestUtils.authenticateUserAndGetToken("placeuser");

        // Create 2 itineraries in the same place
        ExtendedItineraryDTO itinerary1 = createTestItinerary();
        ExtendedItineraryDTO itinerary2 = createTestItinerary();
        
        RestAssured
        .given()
            .contentType(ContentType.JSON)
            .cookie("auth_token", authToken)
            .body(itinerary1)
        .when()
            .post("/v1/itineraries")
        .then()
            .statusCode(201);

        RestAssured
        .given()
            .contentType(ContentType.JSON)
            .cookie("auth_token", authToken)
            .body(itinerary2)
        .when()
            .post("/v1/itineraries")
        .then()
            .statusCode(201);

        // Verify places_visited counts unique places (only 1)
        RestAssured
        .given()
            .cookie("auth_token", authToken)
        .when()
            .get("/v1/stats/user")
        .then()
            .statusCode(200)
            .body("stats[1].value", Matchers.is(1));
    }

    @Test
    @DisplayName("Test stats are isolated per user")
    public void testStatsAreIsolatedPerUser() {
        String authToken1 = AuthTestUtils.authenticateUserAndGetToken("user1");
        String authToken2 = AuthTestUtils.authenticateUserAndGetToken("user2");

        // User 1 creates itinerary
        ExtendedItineraryDTO itinerary = createTestItinerary();
        
        RestAssured
        .given()
            .contentType(ContentType.JSON)
            .cookie("auth_token", authToken1)
            .body(itinerary)
        .when()
            .post("/v1/itineraries")
        .then()
            .statusCode(201);

        // User 1 has stats > 0
        RestAssured
        .given()
            .cookie("auth_token", authToken1)
        .when()
            .get("/v1/stats/user")
        .then()
            .statusCode(200)
            .body("stats[0].value", Matchers.greaterThan(0));

        // User 2 has stats = 0
        RestAssured
        .given()
            .cookie("auth_token", authToken2)
        .when()
            .get("/v1/stats/user")
        .then()
            .statusCode(200)
            .body("stats[0].value", Matchers.is(0))
            .body("stats[1].value", Matchers.is(0))
            .body("stats[2].value", Matchers.is(0));
    }

    @Test
    @DisplayName("Test stats with invalid auth token")
    public void testStatsWithInvalidAuthToken() {
        RestAssured
        .given()
            .cookie("auth_token", "invalid_token_123")
        .when()
            .get("/v1/stats/user")
        .then()
            .statusCode(401);
    }

    @Test
    @DisplayName("Test get users by plan stats as admin")
    public void testGetUsersByPlanStatsAsAdmin() {
        LoginRequest adminLogin = new LoginRequest("admin", "secure_password");

        String adminToken = RestAssured
        .given()
            .contentType(ContentType.JSON)
            .body(adminLogin)
        .when()
            .post("/auth/login")
        .then()
            .statusCode(200)
            .extract()
            .cookie("auth_token");

        RestAssured
        .given()
            .cookie("auth_token", adminToken)
        .when()
            .get("/v1/stats/users-by-plan")
        .then()
            .statusCode(200)
            .contentType(ContentType.JSON)
            .body("items", Matchers.notNullValue());
    }

    @Test
    @DisplayName("Test get users by plan stats forbidden for non-admin")
    public void testGetUsersByPlanStatsForbiddenForUser() {
        String userToken = AuthTestUtils.authenticateUserAndGetToken("regular_forbidden");

        RestAssured
        .given()
            .cookie("auth_token", userToken)
        .when()
            .get("/v1/stats/users-by-plan")
        .then()
            .statusCode(403);
    }

    // [Helper Methods] ===============================================
    
    private ExtendedItineraryDTO createTestItinerary() {
        CoordinatesDTO coordinates = new CoordinatesDTO(48.8566, 2.3522);
        LocationDTO location = new LocationDTO("Eiffel Tower", "Paris, France", coordinates);
        ActivityDTO activity = new ActivityDTO("Visit Eiffel Tower", "Sightseeing", location, "09:00", "2h");
        ItineraryDayDTO day = new ItineraryDayDTO(1, List.of(activity));
        
        return new ExtendedItineraryDTO(
            null, "Paris", "Paris",
            2, 1000.0, "2025-06-10", List.of("romantic", "city"),
            0L, ItineraryStatusDTO.DRAFT, List.of(day), 1, null
        );
    }
}
