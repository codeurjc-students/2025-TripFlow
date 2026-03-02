package com.tripflow.integration;

import com.tripflow.dto.user.UpdateUserRequest;
import com.tripflow.integration.utils.AuthTestUtils;
import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;

import static org.hamcrest.Matchers.*;

@Tag("integration")
public class UserEndpointsTest extends BaseIntegrationTest {

    @Test
    @DisplayName("Test get all users")
    public void testGetAllUsers() {
        String token = AuthTestUtils.authenticateUserAndGetToken("User1", false);

        RestAssured
            .given()
                .contentType(ContentType.JSON)
                .cookie("auth_token", token)
            .when()
                .get("/v1/users")
            .then()
                .statusCode(200)
                .body("page", not(empty()))
                .body("totalItems", greaterThan(0));
    }

    @Test
    @DisplayName("Test get user by username")
    public void testGetUserByUsername() {
        String username = AuthTestUtils.generateUniqueValue("User");
        AuthTestUtils.authenticateUserAndGetToken(username, false);

        RestAssured
            .given()
                .contentType(ContentType.JSON)
            .when()
                .get("/v1/users/" + username)
            .then()
                .statusCode(200)
                .body("username", equalTo(username));
    }

    @Test
    @DisplayName("Test get user by username not found")
    public void testGetUserByUsernameNotFound() {
        RestAssured
            .given()
                .contentType(ContentType.JSON)
            .when()
                .get("/v1/users/nonexistentuser")
            .then()
                .statusCode(404);
    }

    @Test
    @DisplayName("Test update user successfully")
    public void testUpdateUser() {
        String username = AuthTestUtils.generateUniqueValue("User");
        String token = AuthTestUtils.authenticateUserAndGetToken(username, false);

        UpdateUserRequest updateRequest = new UpdateUserRequest(
            "Updated Name",
            "Updated Description",
            "Updated Location",
            null
        );

        RestAssured
            .given()
                .contentType(ContentType.JSON)
                .cookie("auth_token", token)
                .body(updateRequest)
            .when()
                .put("/v1/users/" + username)
            .then()
                .statusCode(200)
                .body("name", equalTo("Updated Name"))
                .body("description", equalTo("Updated Description"))
                .body("location", equalTo("Updated Location"));
    }

    @Test
    @DisplayName("Test update user unauthenticated")
    public void testUpdateUserUnauthenticated() {
        String username = AuthTestUtils.generateUniqueValue("User");
        AuthTestUtils.authenticateUserAndGetToken(username, false);

        UpdateUserRequest updateRequest = new UpdateUserRequest(
            "Updated Name",
            "Updated Description",
            "Updated Location",
            null
        );

        RestAssured
            .given()
                .contentType(ContentType.JSON)
                .body(updateRequest)
            .when()
                .put("/v1/users/" + username)
            .then()
                .statusCode(401);
    }

    @Test
    @DisplayName("Test update another user forbidden")
    public void testUpdateAnotherUserForbidden() {
        String username1 = AuthTestUtils.generateUniqueValue("User");
        String token1 = AuthTestUtils.authenticateUserAndGetToken(username1, false);

        String username2 = AuthTestUtils.generateUniqueValue("User");
        AuthTestUtils.authenticateUserAndGetToken(username2, false);

        UpdateUserRequest updateRequest = new UpdateUserRequest("Name", "Desc", "Loc", null);

        RestAssured
            .given()
                .contentType(ContentType.JSON)
                .cookie("auth_token", token1)
                .body(updateRequest)
            .when()
                .put("/v1/users/" + username2)
            .then()
                .statusCode(403);
    }

    @Test
    @DisplayName("Test delete user successfully")
    public void testDeleteUser() {
        String username = AuthTestUtils.generateUniqueValue("User");
        String token = AuthTestUtils.authenticateUserAndGetToken(username, false);

        RestAssured
            .given()
                .contentType(ContentType.JSON)
                .cookie("auth_token", token)
            .when()
                .delete("/v1/users/" + username)
            .then()
                .statusCode(204);
        
        RestAssured
            .given()
                .contentType(ContentType.JSON)
            .when()
                .get("/v1/users/" + username)
            .then()
                .statusCode(404);
    }

    @Test
    @DisplayName("Test delete another user forbidden")
    public void testDeleteAnotherUserForbidden() {
        String username1 = AuthTestUtils.generateUniqueValue("User");
        String token1 = AuthTestUtils.authenticateUserAndGetToken(username1, false);

        String username2 = AuthTestUtils.generateUniqueValue("User");
        AuthTestUtils.authenticateUserAndGetToken(username2, false);

        RestAssured
            .given()
                .contentType(ContentType.JSON)
                .cookie("auth_token", token1)
            .when()
                .delete("/v1/users/" + username2)
            .then()
                .statusCode(403);
    }

    @Test
    @DisplayName("Test upload avatar successfully")
    public void testUploadAvatar() throws IOException {
        String username = AuthTestUtils.generateUniqueValue("User");
        String token = AuthTestUtils.authenticateUserAndGetToken(username, false);

        File tempFile = File.createTempFile("avatar", ".jpeg");
        Files.write(tempFile.toPath(), "dummy image content".getBytes());

        RestAssured
            .given()
                .cookie("auth_token", token)
                .multiPart("avatar", tempFile, "image/jpeg")
            .when()
                .post("/v1/users/" + username + "/avatar")
            .then()
                .statusCode(200);
        
        tempFile.delete();
    }

    @Test
    @DisplayName("Test upload avatar forbidden for another user")
    public void testUploadAvatarForbidden() throws IOException {
        String username1 = AuthTestUtils.generateUniqueValue("User");
        String token1 = AuthTestUtils.authenticateUserAndGetToken(username1, false);

        String username2 = AuthTestUtils.generateUniqueValue("User");
        AuthTestUtils.authenticateUserAndGetToken(username2, false);

        File tempFile = File.createTempFile("avatar", ".jpeg");
        Files.write(tempFile.toPath(), "dummy image content".getBytes());

        RestAssured
            .given()
                .cookie("auth_token", token1)
                .multiPart("avatar", tempFile, "image/jpeg")
            .when()
                .post("/v1/users/" + username2 + "/avatar")
            .then()
                .statusCode(403);
        
        tempFile.delete();
    }

    @Test
    @DisplayName("Test get avatar successfully")
    public void testGetAvatar() throws IOException {
        String username = AuthTestUtils.generateUniqueValue("User");
        String token = AuthTestUtils.authenticateUserAndGetToken(username, false);

        File tempFile = File.createTempFile("avatar", ".jpg");
        Files.write(tempFile.toPath(), "dummy image content".getBytes());

        RestAssured
            .given()
                .cookie("auth_token", token)
                .multiPart("avatar", tempFile, "image/jpeg")
            .when()
                .post("/v1/users/" + username + "/avatar")
            .then()
                .statusCode(200);

        RestAssured
            .given()
            .when()
                .get("/v1/users/" + username + "/avatar")
            .then()
                .statusCode(200)
                .contentType("image/jpeg");
        
        tempFile.delete();
    }
    
    @Test
    @DisplayName("Test get avatar not found")
    public void testGetAvatarNotFound() {
        String username = AuthTestUtils.generateUniqueValue("User");
        AuthTestUtils.authenticateUserAndGetToken(username, false);

        RestAssured
            .given()
            .when()
                .get("/v1/users/" + username + "/avatar")
            .then()
                .statusCode(404);
    }
    
    @Test
    @DisplayName("Test upload invalid avatar file")
    public void testUploadInvalidAvatar() throws IOException {
        String username = AuthTestUtils.generateUniqueValue("User");
        String token = AuthTestUtils.authenticateUserAndGetToken(username, false);

        File tempFile = File.createTempFile("invalid", ".txt");
        Files.write(tempFile.toPath(), "not an image".getBytes());

        RestAssured
            .given()
                .cookie("auth_token", token)
                .multiPart("avatar", tempFile)
            .when()
                .post("/v1/users/" + username + "/avatar")
            .then()
                .statusCode(anyOf(is(400), is(415)));
        
        tempFile.delete();
    }
}
