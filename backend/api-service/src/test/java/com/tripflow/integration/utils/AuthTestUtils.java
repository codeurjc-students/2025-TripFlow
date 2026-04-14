package com.tripflow.integration.utils;

import com.tripflow.dto.auth.LoginRequest;
import com.tripflow.dto.user.RegisterUserRequest;

import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import io.restassured.response.Response;

import static org.hamcrest.Matchers.*;

public class AuthTestUtils {

    private static final int MAX_USERNAME_LENGTH = 30;
    private static final String EMAIL_DOMAIN = "@example.com";

    /**
     * Registers and logs in a user, returning the authentication token.
     * 
     * @param username the username for the test user
     * @return the authentication token
     */
    public static String authenticateUserAndGetToken(String username) {
        return authenticateUserAndGetToken(username, true);
    }
    
    /**
     * Registers and logs in a user, returning the authentication token.
     * 
     * @param username the username for the test user
     * @param unique whether the username should be unique
     * @return the authentication token
     */
    public static String authenticateUserAndGetToken(String username, boolean unique) {
        String uniqueUsername = unique
            ? generateUniqueValidUsername(username)
            : username;
            
        String uniqueEmail = unique
            ? uniqueUsername + EMAIL_DOMAIN
            : uniqueUsername + EMAIL_DOMAIN;

        // Register user
        RegisterUserRequest registerRequest = new RegisterUserRequest(
            uniqueEmail,
            uniqueUsername,
            "Ab12345678",
            "Ab12345678"
        );

        RestAssured
        .given()
            .contentType(ContentType.JSON)
            .body(registerRequest)
        .when()
            .post("/auth/register")
        .then()
            .statusCode(201);

        // Login user
        LoginRequest loginRequest = new LoginRequest(uniqueUsername, "Ab12345678");
        
        Response loginResponse = RestAssured
        .given()
            .contentType(ContentType.JSON)
            .body(loginRequest)
        .when()
            .post("/auth/login")
        .then()
            .statusCode(200)
            .body("status", equalTo("SUCCESS"))
            .body("message", equalTo("Login successful"))
            .body("errors", nullValue())
            .body("user", notNullValue())
            .cookie("auth_token", notNullValue())
            .cookie("refresh_token", notNullValue())
            .extract()
            .response();

        return loginResponse.getCookie("auth_token");
    }

    /**
     * Registers and logs in a user with a generated unique username.
     * 
     * @param baseUsername the base username to use (will be made unique)
     * @return the authentication token
     */
    public static String authenticateUserAndGetToken(String baseUsername, long uniqueId) {
        String uniqueUsername = baseUsername + "_" + uniqueId;
        return authenticateUserAndGetToken(uniqueUsername);
    }

    /**
     * Generates a unique value by appending the current time in nanoseconds to the given prefix.
     *
     * @param prefix the prefix to use
     * @return the unique value
     */
    public static String generateUniqueValue(String prefix) {
        return prefix + System.nanoTime();
    }
    
    /**
     * Generates a unique email by appending the current time in nanoseconds to the given prefix.
     *
     * @param prefix the prefix to use
     * @return the unique email
     */
    public static String generateUniqueEmail(String prefix) {
        return prefix + System.nanoTime() + EMAIL_DOMAIN;
    }

    private static String generateUniqueValidUsername(String prefix) {
        String normalizedPrefix = prefix == null
            ? "user"
            : prefix.replaceAll("[^a-zA-Z0-9_]", "");

        if (normalizedPrefix.isBlank()) {
            normalizedPrefix = "user";
        }

        String suffix = Long.toString(System.nanoTime(), 36);
        int maxPrefixLength = Math.max(1, MAX_USERNAME_LENGTH - suffix.length() - 1);
        if (normalizedPrefix.length() > maxPrefixLength) {
            normalizedPrefix = normalizedPrefix.substring(0, maxPrefixLength);
        }

        return normalizedPrefix + "_" + suffix;
    }
}
