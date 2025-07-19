package com.tripflow.integration;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import io.restassured.RestAssured;

@Tag("integration")
public class HealthCheckTest extends BaseIntegrationTest{
    
    @Test
    @DisplayName("Health Check Endpoint")
    public void healthCheck() {
        RestAssured.given()
            .when()
            .get("/health")
            .then()
            .statusCode(200);
    }
}