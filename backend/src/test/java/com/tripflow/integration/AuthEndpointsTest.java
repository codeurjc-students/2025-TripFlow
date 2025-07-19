package com.tripflow.integration;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import com.tripflow.dto.auth.LoginRequest;
import com.tripflow.dto.user.RegisterUserRequest;

import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import io.restassured.response.Response;

import static org.hamcrest.Matchers.*;

@Tag("integration")
public class AuthEndpointsTest extends BaseIntegrationTest {
    
    @Test
    @DisplayName("Test successful user registration")
    public void testSuccessfulRegisterEndpoint() {
        // Prepare the registration request body
        RegisterUserRequest registerRequest = new RegisterUserRequest(
            this.generateUniqueValue("TestUser"),
            "Ab12345678",
            "Ab12345678"
        );

        // Send the registration request
        RestAssured
        .given()
            .contentType(ContentType.JSON)
            .body(registerRequest)
        .when()
            .post("/auth/register")
        .then()
            .statusCode(201)
            .body("message", equalTo("Registration successful"))
            .body("status", equalTo("SUCCESS"))
            .body("errors", nullValue())
            .body("user", notNullValue());
    }

    @Test
    @DisplayName("Test registration with a short password")
    public void testRegisterWithShortPassword() {
        // Prepare the registration request body
        RegisterUserRequest registerRequest = new RegisterUserRequest(
            this.generateUniqueValue("TestUser"),
            "weak",
            "weak"
        );

        // Send the registration request
        RestAssured
        .given()
            .contentType(ContentType.JSON)
            .body(registerRequest)
        .when()
            .post("/auth/register")
        .then()
            .statusCode(400)
            .body("message", nullValue())
            .body("status", equalTo("FAILURE"))
            .body("errors.password", equalTo("Password must be at least 8 characters long."))
            .body("user", nullValue());
    }

    @Test
    @DisplayName("Test registration with a weak password")
    public void testRegisterWithWeakPassword() {
        // Prepare the registration request body
        RegisterUserRequest registerRequest = new RegisterUserRequest(
            this.generateUniqueValue("TestUser"),
            "12345678",
            "12345678"
        );

        // Send the registration request
        RestAssured
        .given()
            .contentType(ContentType.JSON)
            .body(registerRequest)
        .when()
            .post("/auth/register")
        .then()
            .statusCode(400)
            .body("message", nullValue())
            .body("status", equalTo("FAILURE"))
            .body("errors.password", equalTo("Password must contain at least one uppercase letter, one lowercase letter, and one number."))
            .body("user", nullValue());
    }

    @Test
    @DisplayName("Test registration with mismatched passwords")
    public void testRegisterWithMismatchedPasswords() {
        // Prepare the registration request body
        RegisterUserRequest registerRequest = new RegisterUserRequest(
            this.generateUniqueValue("TestUser"),
            "Ab12345678",
            "Ab12345679123"
        );

        // Send the registration request
        RestAssured
        .given()
            .contentType(ContentType.JSON)
            .body(registerRequest)
        .when()
            .post("/auth/register")
        .then()
            .statusCode(400)
            .body("message", nullValue())
            .body("status", equalTo("FAILURE"))
            .body("errors.password", equalTo("Password and confirmation do not match."))
            .body("user", nullValue());
    }

    @Test
    @DisplayName("Test registration with a invalid username")
    public void testRegisterWithInvalidUsername() {
        // Prepare the registration request body
        RegisterUserRequest registerRequest = new RegisterUserRequest(
            this.generateUniqueValue("Invalid@User"),
            "Ab12345678",
            "Ab12345678"
        );

        // Send the registration request
        RestAssured
        .given()
            .contentType(ContentType.JSON)
            .body(registerRequest)
        .when()
            .post("/auth/register")
        .then()
            .statusCode(400)
            .body("message", nullValue())
            .body("status", equalTo("FAILURE"))
            .body("errors.username", equalTo("Username can only contain letters, numbers, and underscores."))
            .body("user", nullValue());
    }

    @Test
    @DisplayName("Test registration with an existing username")
    public void testRegisterWithExistingUsername() {
        // Prepare the registration request body
        RegisterUserRequest registerRequest = new RegisterUserRequest(
            this.generateUniqueValue("ExistingUser"),
            "Ab12345678",
            "Ab12345678"
        );

        // First, register the user to ensure the username exists
        RestAssured
        .given()
            .contentType(ContentType.JSON)
            .body(registerRequest)
        .when()
            .post("/auth/register")
        .then()
            .statusCode(201)
            .body("message", equalTo("Registration successful"))
            .body("status", equalTo("SUCCESS"))
            .body("errors", nullValue())
            .body("user", notNullValue());

        // Send a second registration request with the same username
        RestAssured
        .given()
            .contentType(ContentType.JSON)
            .body(registerRequest)
        .when()
            .post("/auth/register")
        .then()
            .statusCode(400)
            .body("message", nullValue())
            .body("status", equalTo("FAILURE"))
            .body("errors.username", equalTo("User already exists with username"))
            .body("user", nullValue());
    }

    @Test
    @DisplayName("Test successful login")
    public void testSuccessfulLogin() {
        String uniqueUsername = this.generateUniqueValue("LoginUser123");
        // Prepare the registration request body
        RegisterUserRequest registerRequest = new RegisterUserRequest(
            uniqueUsername,
            "Ab12345678",
            "Ab12345678"
        );

        // Prepare the login request body
        LoginRequest loginRequest = new LoginRequest(
            uniqueUsername,
            "Ab12345678"
        );

        // First, register the user
        RestAssured
        .given()
            .contentType(ContentType.JSON)
            .body(registerRequest)
        .when()
            .post("/auth/register")
        .then()
            .statusCode(201);
        
        // Then, send the login request
        RestAssured
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
            .cookie("refresh_token", notNullValue());
    }

    @Test
    @DisplayName("Test login with unregistered user")
    public void testLoginWithUnregisteredUser() {
        // Prepare the login request body
        LoginRequest loginRequest = new LoginRequest(
            this.generateUniqueValue("UnregisteredUser"),
            "Ab12345678"
        );

        // Send the login request
        RestAssured
        .given()
            .contentType(ContentType.JSON)
            .body(loginRequest)
        .when()
            .post("/auth/login")
        .then()
            .statusCode(401)
            .body("status", equalTo("FAILURE"))
            .body("message", equalTo("Invalid credentials"))
            .body("errors", nullValue())
            .body("user", nullValue());
    }

    @Test
    @DisplayName("Test login with incorrect password")
    public void testLoginWithIncorrectPassword() {
        // Prepare the registration request body
        RegisterUserRequest registerRequest = new RegisterUserRequest(
            this.generateUniqueValue("LoginUser"),
            "Ab12345678",
            "Ab12345678"
        );

        // First, register the user
        RestAssured
        .given()
            .contentType(ContentType.JSON)
            .body(registerRequest)
        .when()
            .post("/auth/register")
        .then()
            .statusCode(201);

        // Prepare the login request body with incorrect password
        LoginRequest loginRequest = new LoginRequest(
            "LoginUser",
            "WrongPassword"
        );

        // Send the login request
        RestAssured
        .given()
            .contentType(ContentType.JSON)
            .body(loginRequest)
        .when()
            .post("/auth/login")
        .then()
            .statusCode(401)
            .body("status", equalTo("FAILURE"))
            .body("message", equalTo("Invalid credentials"))
            .body("errors", nullValue())
            .body("user", nullValue());
    }

    @Test
    @DisplayName("Test successful logout")
    public void testSuccessfulLogout() {
        String uniqueUsername = this.generateUniqueValue("LogoutUser");
        // Prepare the registration request body
        RegisterUserRequest registerRequest = new RegisterUserRequest(
            uniqueUsername,
            "Ab12345678",
            "Ab12345678"
        );

        // Prepare the login request body
        LoginRequest loginRequest = new LoginRequest(
            uniqueUsername,
            "Ab12345678"
        );

        // First, register the user
        RestAssured
        .given()
            .contentType(ContentType.JSON)
            .body(registerRequest)
        .when()
            .post("/auth/register")
        .then()
            .statusCode(201);
        
        // Then, login the user
        Response loginResponse = RestAssured
        .given()
            .contentType(ContentType.JSON)
            .body(loginRequest)
        .when()
            .post("/auth/login")
        .then()
            .statusCode(200)
            .extract()
            .response();
        
        // Now, send the logout request
        RestAssured
        .given()
            .cookie("auth_token", loginResponse.getCookie("auth_token"))
            .cookie("refresh_token", loginResponse.getCookie("refresh_token"))
        .when()
            .post("/auth/logout")
        .then()
            .statusCode(200)
            .cookie("auth_token", equalTo(""))
            .cookie("refresh_token", equalTo(""))
            .body("message", equalTo("Logout successful"))
            .body("user", nullValue())
            .body("status", equalTo("SUCCESS"));
    }

    @Test
    @DisplayName("Test refresh token with a valid token")
    public void testRefreshWithValidToken() {
        String uniqueUsername = this.generateUniqueValue("RefreshUser");
        
        // Prepare the registration request body
        RegisterUserRequest registerRequest = new RegisterUserRequest(
            uniqueUsername,
            "Ab12345678",
            "Ab12345678"
        );

        // Prepare the login request body
        LoginRequest loginRequest = new LoginRequest(
            uniqueUsername,
            "Ab12345678"
        );

        // First, register the user
        RestAssured
        .given()
            .contentType(ContentType.JSON)
            .body(registerRequest)
        .when()
            .post("/auth/register")
        .then()
            .statusCode(201);
        
        // Then, login the user to get a refresh token
        Response loginResponse = RestAssured
        .given()
            .contentType(ContentType.JSON)
            .body(loginRequest)
        .when()
            .post("/auth/login")
        .then()
            .statusCode(200)
            .extract()
            .response();

        String authToken = loginResponse.getCookie("auth_token");
        String refreshToken = loginResponse.getCookie("refresh_token");

        // Now, send the refresh request with the cookies
        RestAssured
        .given()
            .cookie("refresh_token", refreshToken)
            .cookie("auth_token", authToken)
        .when()
            .post("/auth/refresh")
        .then()
            .statusCode(200)
            .body("status", equalTo("SUCCESS"))
            .body("message", equalTo("Token refreshed successfully"))
            .body("user", notNullValue())
            .cookie("auth_token", not(equalTo(authToken)));
    }
}