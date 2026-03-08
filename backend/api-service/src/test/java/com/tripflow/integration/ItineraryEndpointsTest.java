package com.tripflow.integration;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import com.tripflow.dto.itinerary.ActivityDTO;
import com.tripflow.dto.itinerary.CoordinatesDTO;
import com.tripflow.dto.itinerary.ExtendedItineraryDTO;
import com.tripflow.dto.itinerary.ItineraryDayDTO;
import com.tripflow.dto.itinerary.ItineraryStatusDTO;
import com.tripflow.dto.itinerary.LocationDTO;
import com.tripflow.integration.utils.AuthTestUtils;

import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import io.restassured.response.Response;

import static org.hamcrest.Matchers.*;

import java.util.List;

@Tag("integration")
public class ItineraryEndpointsTest extends BaseIntegrationTest {
    
    @Test
    @DisplayName("Test successful itinerary creation")
    public void testCreateItinerarySuccess() {
        String authToken = AuthTestUtils.authenticateUserAndGetToken("user");
        ExtendedItineraryDTO itineraryDTO = createTestItinerary();

        RestAssured
        .given()
            .contentType(ContentType.JSON)
            .cookie("auth_token", authToken)
            .body(itineraryDTO)
        .when()
            .post("/v1/itineraries")
        .then()
            .statusCode(201)
            .body("place", equalTo(itineraryDTO.place()))
            .body("id", notNullValue())
            .body("days", hasSize(1))
            .body("days[0].day", equalTo(1))
            .body("days[0].activities", hasSize(1))
            .body("days[0].activities[0].activity", equalTo(
                itineraryDTO.days().get(0).activities().get(0).activity()
            ))
            .body("permissions", notNullValue())
            .body("permissions.view", is(true))
            .body("permissions.edit", is(true))
            .body("permissions.delete", is(true));
    }

    @Test
    @DisplayName("Test create itinerary without authentication")
    public void testCreateItineraryUnauthorized() {
        ExtendedItineraryDTO itineraryDTO = createTestItinerary();

        RestAssured
        .given()
            .contentType(ContentType.JSON)
            .body(itineraryDTO)
        .when()
            .post("/v1/itineraries")
        .then()
            .statusCode(401);
    }

    @Test
    @DisplayName("Test get all itineraries with pagination")
    public void testGetAllItinerariesPaginated() {
        String authToken = AuthTestUtils.authenticateUserAndGetToken("user");

        // Create a test itinerary first
        ExtendedItineraryDTO itineraryDTO = createTestItinerary();
        
        RestAssured
        .given()
            .contentType(ContentType.JSON)
            .cookie("auth_token", authToken)
            .body(itineraryDTO)
        .when()
            .post("/v1/itineraries")
        .then()
            .statusCode(201);

        // Get all itineraries
        RestAssured
        .given()
            .cookie("auth_token", authToken)
            .param("page", 0)
            .param("size", 10)
        .when()
            .get("/v1/itineraries")
        .then()
            .statusCode(200)
            .body("page", hasSize(greaterThanOrEqualTo(1)))
            .body("page[0].days", nullValue())
            .body("currentPage", equalTo(0))
            .body("itemsPerPage", equalTo(10))
            .body("totalItems", greaterThanOrEqualTo(1))
            .body("totalPages", greaterThanOrEqualTo(1))
            .body("isLastPage", is(true))
            .body("page[0].permissions", notNullValue())
            .body("page[0].permissions.view", is(true))
            .body("page[0].permissions.edit", is(true))
            .body("page[0].permissions.delete", is(true));
    }

    @Test
    @DisplayName("Test get all itineraries with search query")
    public void testGetAllItinerariesWithSearch() {
        String authToken = AuthTestUtils.authenticateUserAndGetToken("user");

        // Create a test itinerary first
        ExtendedItineraryDTO itineraryDTO = createTestItinerary();
        
        RestAssured
        .given()
            .contentType(ContentType.JSON)
            .cookie("auth_token", authToken)
            .body(itineraryDTO)
        .when()
            .post("/v1/itineraries")
        .then()
            .statusCode(201);

        // Get all itineraries with search
        RestAssured
        .given()
            .cookie("auth_token", authToken)
            .param("page", 0)
            .param("size", 10)
            .param("search", "Paris")
        .when()
            .get("/v1/itineraries")
        .then()
            .statusCode(200)
            .body("page", hasSize(greaterThanOrEqualTo(1)))
            .body("page[0].place", equalTo("Paris"))
            .body("currentPage", equalTo(0))
            .body("itemsPerPage", equalTo(10))
            .body("totalItems", greaterThanOrEqualTo(1))
            .body("totalPages", greaterThanOrEqualTo(1))
            .body("isLastPage", is(true));
    }

    @Test
    @DisplayName("Test get all itineraries without authentication")
    public void testGetAllItinerariesUnauthorized() {
        RestAssured
        .given()
            .param("page", 0)
            .param("size", 10)
        .when()
            .get("/v1/itineraries")
        .then()
            .statusCode(401);
    }

    @Test
    @DisplayName("Test get itinerary by id successfully")
    public void testGetItineraryByIdSuccess() {
        String authToken = AuthTestUtils.authenticateUserAndGetToken("user");
        ExtendedItineraryDTO itineraryDTO = createTestItinerary();

        // Create itinerary
        Response createResponse = RestAssured
        .given()
            .contentType(ContentType.JSON)
            .cookie("auth_token", authToken)
            .body(itineraryDTO)
        .when()
            .post("/v1/itineraries")
        .then()
            .statusCode(201)
            .extract()
            .response();

        Long itineraryId = createResponse.jsonPath().getLong("id");

        // Get itinerary by id
        RestAssured
        .given()
            .cookie("auth_token", authToken)
        .when()
            .get("/v1/itineraries/{id}", itineraryId)
        .then()
            .statusCode(200)
            .body("id", equalTo(itineraryId.intValue()))
            .body("place", equalTo(itineraryDTO.place()))
            .body("place", equalTo("Paris"))
            .body("permissions", notNullValue())
            .body("permissions.view", is(true))
            .body("permissions.edit", is(true))
            .body("permissions.delete", is(true));
    }

    @Test
    @DisplayName("Test get itinerary by non-existent id")
    public void testGetItineraryByIdNotFound() {
        String authToken = AuthTestUtils.authenticateUserAndGetToken("user");

        RestAssured
        .given()
            .cookie("auth_token", authToken)
        .when()
            .get("/v1/itineraries/{id}", 99999L)
        .then()
            .statusCode(404);
    }

    @Test
    @DisplayName("Test get itinerary by id without authentication")
    public void testGetItineraryByIdUnauthorized() {
        RestAssured
        .when()
            .get("/v1/itineraries/{id}", 1L)
        .then()
            .statusCode(401);
    }

    @Test
    @DisplayName("Test update itinerary successfully")
    public void testUpdateItinerarySuccess() {
        String authToken = AuthTestUtils.authenticateUserAndGetToken("user");
        ExtendedItineraryDTO itineraryDTO = createTestItinerary();

        // Create itinerary
        Response createResponse = RestAssured
        .given()
            .contentType(ContentType.JSON)
            .cookie("auth_token", authToken)
            .body(itineraryDTO)
        .when()
            .post("/v1/itineraries")
        .then()
            .statusCode(201)
            .extract()
            .response();

        Long itineraryId = createResponse.jsonPath().getLong("id");

        // Update itinerary
        CoordinatesDTO newCoordinates = new CoordinatesDTO(41.9028, 12.4964);
        LocationDTO newLocation = new LocationDTO("Colosseum", "Rome, Italy", newCoordinates);
        ActivityDTO newActivity = new ActivityDTO("Visit Colosseum", "Sightseeing", newLocation, "10:00", "2h");
        ItineraryDayDTO newDay = new ItineraryDayDTO(1, List.of(newActivity));
        ExtendedItineraryDTO updatedItinerary = new ExtendedItineraryDTO(
            itineraryId, "Rome Trip", "Rome",
            2, 1500.0, "2025-06-10", List.of("history", "culture"),
            1L, ItineraryStatusDTO.DRAFT, List.of(newDay), 1, null
        );

        RestAssured
        .given()
            .contentType(ContentType.JSON)
            .cookie("auth_token", authToken)
            .body(updatedItinerary)
        .when()
            .put("/v1/itineraries/{id}", itineraryId)
        .then()
            .statusCode(200)
            .body("id", equalTo(itineraryId.intValue()))
            .body("title", equalTo("Rome Trip"))
            .body("place", equalTo("Rome"))
            .body("people", equalTo(2))
            .body("budget", equalTo(1500.0f))
            .body("date", equalTo("2025-06-10"))
            .body("tags", hasItems("history", "culture"))
            .body("days[0].activities[0].activity", equalTo("Visit Colosseum"));
    }

    @Test
    @DisplayName("Test update non-existent itinerary")
    public void testUpdateItineraryNotFound() {
        String authToken = AuthTestUtils.authenticateUserAndGetToken("user");
        ExtendedItineraryDTO itineraryDTO = createTestItinerary();

        RestAssured
        .given()
            .contentType(ContentType.JSON)
            .cookie("auth_token", authToken)
            .body(itineraryDTO)
        .when()
            .put("/v1/itineraries/{id}", 99999L)
        .then()
            .statusCode(404);
    }

    @Test
    @DisplayName("Test update itinerary without authentication")
    public void testUpdateItineraryUnauthorized() {
        ExtendedItineraryDTO itineraryDTO = createTestItinerary();

        RestAssured
        .given()
            .contentType(ContentType.JSON)
            .body(itineraryDTO)
        .when()
            .put("/v1/itineraries/{id}", 1L)
        .then()
            .statusCode(401);
    }

    @Test
    @DisplayName("Test delete itinerary successfully")
    public void testDeleteItinerarySuccess() {
        String authToken = AuthTestUtils.authenticateUserAndGetToken("user");
        ExtendedItineraryDTO itineraryDTO = createTestItinerary();

        // Create itinerary
        Response createResponse = RestAssured
        .given()
            .contentType(ContentType.JSON)
            .cookie("auth_token", authToken)
            .body(itineraryDTO)
        .when()
            .post("/v1/itineraries")
        .then()
            .statusCode(201)
            .extract()
            .response();

        Long itineraryId = createResponse.jsonPath().getLong("id");

        // Delete itinerary
        RestAssured
        .given()
            .cookie("auth_token", authToken)
        .when()
            .delete("/v1/itineraries/{id}", itineraryId)
        .then()
            .statusCode(204);

        // Verify itinerary is deleted
        RestAssured
        .given()
            .cookie("auth_token", authToken)
        .when()
            .get("/v1/itineraries/{id}", itineraryId)
        .then()
            .statusCode(404);
    }

    @Test
    @DisplayName("Test delete non-existent itinerary")
    public void testDeleteItineraryNotFound() {
        String authToken = AuthTestUtils.authenticateUserAndGetToken("user");

        RestAssured
        .given()
            .cookie("auth_token", authToken)
        .when()
            .delete("/v1/itineraries/{id}", 99999L)
        .then()
            .statusCode(404);
    }

    @Test
    @DisplayName("Test delete itinerary without authentication")
    public void testDeleteItineraryUnauthorized() {
        RestAssured
        .when()
            .delete("/v1/itineraries/{id}", 1L)
        .then()
            .statusCode(401);
    }

    @Test
    @DisplayName("Test create itinerary with multiple days")
    public void testCreateItineraryWithMultipleDays() {
        String authToken = AuthTestUtils.authenticateUserAndGetToken("user");

        // Create itinerary with multiple days
        CoordinatesDTO coords1 = new CoordinatesDTO(48.8566, 2.3522);
        LocationDTO location1 = new LocationDTO("Eiffel Tower", "Paris, France", coords1);
        ActivityDTO activity1 = new ActivityDTO("Visit Eiffel Tower", "Sightseeing", location1, "09:00", "2h");
        ItineraryDayDTO day1 = new ItineraryDayDTO(1, List.of(activity1));

        CoordinatesDTO coords2 = new CoordinatesDTO(48.8606, 2.3376);
        LocationDTO location2 = new LocationDTO("Louvre Museum", "Paris, France", coords2);
        ActivityDTO activity2 = new ActivityDTO("Visit Louvre", "Museum", location2, "11:15", "3h");
        ItineraryDayDTO day2 = new ItineraryDayDTO(2, List.of(activity2));

        ExtendedItineraryDTO multiDayItinerary = new ExtendedItineraryDTO(
            null, "Paris 2-Day Trip", "Paris",
            2, 1000.0, "2025-06-10", List.of("art", "history"),
            0L, ItineraryStatusDTO.DRAFT, List.of(day1, day2), 2, null
        );

        RestAssured
        .given()
            .contentType(ContentType.JSON)
            .cookie("auth_token", authToken)
            .body(multiDayItinerary)
        .when()
            .post("/v1/itineraries")
        .then()
            .statusCode(201)
            .body("days", hasSize(2))
            .body("days[0].day", equalTo(1))
            .body("days[1].day", equalTo(2))
            .body("days[0].activities[0].activity", equalTo("Visit Eiffel Tower"))
            .body("days[1].activities[0].activity", equalTo("Visit Louvre"));
    }

    // [Helper Methods] ===============================================

    /**
     * Creates a test itinerary DTO for use in tests.
     * 
     * @return a sample ExtendedItineraryDTO
     */
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