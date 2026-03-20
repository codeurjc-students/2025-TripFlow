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
import com.tripflow.dto.itinerary.collaborator.UpdateCollaboratorRequest;
import com.tripflow.integration.utils.AuthTestUtils;

import io.restassured.RestAssured;
import io.restassured.http.ContentType;

@Tag("integration")
public class CollaborationEndpointsTest extends BaseIntegrationTest {

    @Test
    @DisplayName("Should send an invitation with VIEWER role (201)")
    public void testSendInvitationViewer() {
        String[] owner = createUserWithToken("owner_inv_v");
        String[] collaborator = createUserWithToken("collab_inv_v");
        Long itineraryId = createItineraryAndGetId(owner[1]);

        RestAssured
            .given()
                .contentType(ContentType.JSON)
                .cookie("auth_token", owner[1])
                .body(new AddCollaboratorRequest(collaborator[0], CollaboratorRoleDTO.VIEWER))
            .when()
                .post("/v1/itineraries/{id}/collaborators", itineraryId)
            .then()
                .statusCode(201)
                .body("user.username", equalTo(collaborator[0]))
                .body("role", equalTo("VIEWER"))
                .body("status", equalTo("PENDING"))
                .body("itineraryId", equalTo(itineraryId.intValue()))
                .body("itineraryTitle", notNullValue())
                .body("invitedAt", notNullValue())
                .body("acceptedAt", nullValue());
    }

    @Test
    @DisplayName("Should send an invitation with EDITOR role (201)")
    public void testSendInvitationEditor() {
        String[] owner = createUserWithToken("owner_inv_e");
        String[] collaborator = createUserWithToken("collab_inv_e");
        Long itineraryId = createItineraryAndGetId(owner[1]);

        RestAssured
            .given()
                .contentType(ContentType.JSON)
                .cookie("auth_token", owner[1])
                .body(new AddCollaboratorRequest(collaborator[0], CollaboratorRoleDTO.EDITOR))
            .when()
                .post("/v1/itineraries/{id}/collaborators", itineraryId)
            .then()
                .statusCode(201)
                .body("role", equalTo("EDITOR"))
                .body("status", equalTo("PENDING"));
    }

    @Test
    @DisplayName("Should fail when non-owner tries to send invitation (403)")
    public void testSendInvitationForbiddenNonOwner() {
        String[] owner = createUserWithToken("owner_inv_fo");
        String[] collaborator = createUserWithToken("collab_inv_fo");
        String[] thirdUser = createUserWithToken("third_inv_fo");
        Long itineraryId = createItineraryAndGetId(owner[1]);

        RestAssured
            .given()
                .contentType(ContentType.JSON)
                .cookie("auth_token", collaborator[1])
                .body(new AddCollaboratorRequest(thirdUser[0], CollaboratorRoleDTO.VIEWER))
            .when()
                .post("/v1/itineraries/{id}/collaborators", itineraryId)
            .then()
                .statusCode(403);
    }

    @Test
    @DisplayName("Should fail when trying to assign OWNER role (400)")
    public void testSendInvitationCannotAssignOwnerRole() {
        String[] owner = createUserWithToken("owner_inv_or");
        String[] collaborator = createUserWithToken("collab_inv_or");
        Long itineraryId = createItineraryAndGetId(owner[1]);

        RestAssured
            .given()
                .contentType(ContentType.JSON)
                .cookie("auth_token", owner[1])
                .body(new AddCollaboratorRequest(collaborator[0], CollaboratorRoleDTO.OWNER))
            .when()
                .post("/v1/itineraries/{id}/collaborators", itineraryId)
            .then()
                .statusCode(400);
    }

    @Test
    @DisplayName("Should fail when inviting the owner (400)")
    public void testSendInvitationCannotInviteOwner() {
        String[] owner = createUserWithToken("owner_inv_self");
        Long itineraryId = createItineraryAndGetId(owner[1]);

        RestAssured
            .given()
                .contentType(ContentType.JSON)
                .cookie("auth_token", owner[1])
                .body(new AddCollaboratorRequest(owner[0], CollaboratorRoleDTO.VIEWER))
            .when()
                .post("/v1/itineraries/{id}/collaborators", itineraryId)
            .then()
                .statusCode(400);
    }

    @Test
    @DisplayName("Should fail when user already has a pending invitation (409)")
    public void testSendInvitationDuplicate() {
        String[] owner = createUserWithToken("owner_inv_dup");
        String[] collaborator = createUserWithToken("collab_inv_dup");
        Long itineraryId = createItineraryAndGetId(owner[1]);

        RestAssured
            .given()
                .contentType(ContentType.JSON)
                .cookie("auth_token", owner[1])
                .body(new AddCollaboratorRequest(collaborator[0], CollaboratorRoleDTO.VIEWER))
            .when()
                .post("/v1/itineraries/{id}/collaborators", itineraryId)
            .then()
                .statusCode(201);

        RestAssured
            .given()
                .contentType(ContentType.JSON)
                .cookie("auth_token", owner[1])
                .body(new AddCollaboratorRequest(collaborator[0], CollaboratorRoleDTO.EDITOR))
            .when()
                .post("/v1/itineraries/{id}/collaborators", itineraryId)
            .then()
                .statusCode(409);
    }

    @Test
    @DisplayName("Should fail when itinerary does not exist (404)")
    public void testSendInvitationItineraryNotFound() {
        String[] owner = createUserWithToken("owner_inv_nf");
        String[] collaborator = createUserWithToken("collab_inv_nf");

        RestAssured
            .given()
                .contentType(ContentType.JSON)
                .cookie("auth_token", owner[1])
                .body(new AddCollaboratorRequest(collaborator[0], CollaboratorRoleDTO.VIEWER))
            .when()
                .post("/v1/itineraries/{id}/collaborators", 999999L)
            .then()
                .statusCode(404);
    }

    @Test
    @DisplayName("Should accept a pending invitation (200)")
    public void testAcceptInvitation() {
        String[] owner = createUserWithToken("owner_acc");
        String[] collaborator = createUserWithToken("collab_acc");
        Long itineraryId = createItineraryAndGetId(owner[1]);

        sendInvitation(owner[1], itineraryId, collaborator[0], CollaboratorRoleDTO.VIEWER);

        RestAssured
            .given()
                .contentType(ContentType.JSON)
                .cookie("auth_token", collaborator[1])
            .when()
                .put("/v1/itineraries/{id}/collaborators/{username}/accept", itineraryId, collaborator[0])
            .then()
                .statusCode(200)
                .body("status", equalTo("ACCEPTED"))
                .body("acceptedAt", notNullValue());
    }

    @Test
    @DisplayName("Should fail when another user tries to accept (403)")
    public void testAcceptInvitationForbiddenOtherUser() {
        String[] owner = createUserWithToken("owner_acc_fo");
        String[] collaborator = createUserWithToken("collab_acc_fo");
        String[] other = createUserWithToken("other_acc_fo");
        Long itineraryId = createItineraryAndGetId(owner[1]);

        sendInvitation(owner[1], itineraryId, collaborator[0], CollaboratorRoleDTO.VIEWER);

        RestAssured
            .given()
                .contentType(ContentType.JSON)
                .cookie("auth_token", other[1])
            .when()
                .put("/v1/itineraries/{id}/collaborators/{username}/accept", itineraryId, collaborator[0])
            .then()
                .statusCode(403);
    }

    @Test
    @DisplayName("Should fail when invitation is already accepted (400)")
    public void testAcceptInvitationAlreadyAccepted() {
        String[] owner = createUserWithToken("owner_acc_aa");
        String[] collaborator = createUserWithToken("collab_acc_aa");
        Long itineraryId = createItineraryAndGetId(owner[1]);

        sendInvitation(owner[1], itineraryId, collaborator[0], CollaboratorRoleDTO.VIEWER);
        acceptInvitation(collaborator[1], itineraryId, collaborator[0]);

        RestAssured
            .given()
                .contentType(ContentType.JSON)
                .cookie("auth_token", collaborator[1])
            .when()
                .put("/v1/itineraries/{id}/collaborators/{username}/accept", itineraryId, collaborator[0])
            .then()
                .statusCode(400);
    }

    @Test
    @DisplayName("Should decline a pending invitation (204)")
    public void testDeclineInvitation() {
        String[] owner = createUserWithToken("owner_dec");
        String[] collaborator = createUserWithToken("collab_dec");
        Long itineraryId = createItineraryAndGetId(owner[1]);

        sendInvitation(owner[1], itineraryId, collaborator[0], CollaboratorRoleDTO.VIEWER);

        RestAssured
            .given()
                .cookie("auth_token", collaborator[1])
            .when()
                .delete("/v1/itineraries/{id}/collaborators/{username}/decline", itineraryId, collaborator[0])
            .then()
                .statusCode(204);

        RestAssured
            .given()
                .cookie("auth_token", owner[1])
            .when()
                .get("/v1/itineraries/{id}/collaborators", itineraryId)
            .then()
                .statusCode(200)
                .body("size()", equalTo(1))
                .body("[0].role", equalTo("OWNER"));
    }

    @Test
    @DisplayName("Should fail when another user tries to decline (403)")
    public void testDeclineInvitationForbiddenOtherUser() {
        String[] owner = createUserWithToken("owner_dec_fo");
        String[] collaborator = createUserWithToken("collab_dec_fo");
        String[] other = createUserWithToken("other_dec_fo");
        Long itineraryId = createItineraryAndGetId(owner[1]);

        sendInvitation(owner[1], itineraryId, collaborator[0], CollaboratorRoleDTO.VIEWER);

        RestAssured
            .given()
                .cookie("auth_token", other[1])
            .when()
                .delete("/v1/itineraries/{id}/collaborators/{username}/decline", itineraryId, collaborator[0])
            .then()
                .statusCode(403);
    }

    @Test
    @DisplayName("Should return owner as first entry when no collaborators (200)")
    public void testGetCollaboratorsOnlyOwner() {
        String[] owner = createUserWithToken("owner_get_o");
        Long itineraryId = createItineraryAndGetId(owner[1]);

        RestAssured
            .given()
                .cookie("auth_token", owner[1])
            .when()
                .get("/v1/itineraries/{id}/collaborators", itineraryId)
            .then()
                .statusCode(200)
                .body("size()", equalTo(1))
                .body("[0].role", equalTo("OWNER"))
                .body("[0].status", equalTo("ACCEPTED"));
    }

    @Test
    @DisplayName("Should return owner + accepted collaborator (200)")
    public void testGetCollaboratorsOwnerAndCollaborator() {
        String[] owner = createUserWithToken("owner_get_oc");
        String[] collaborator = createUserWithToken("collab_get_oc");
        Long itineraryId = createItineraryAndGetId(owner[1]);

        sendInvitation(owner[1], itineraryId, collaborator[0], CollaboratorRoleDTO.VIEWER);
        acceptInvitation(collaborator[1], itineraryId, collaborator[0]);

        RestAssured
            .given()
                .cookie("auth_token", owner[1])
            .when()
                .get("/v1/itineraries/{id}/collaborators", itineraryId)
            .then()
                .statusCode(200)
                .body("size()", equalTo(2))
                .body("[0].role", equalTo("OWNER"))
                .body("[1].user.username", equalTo(collaborator[0]))
                .body("[1].role", equalTo("VIEWER"))
                .body("[1].status", equalTo("ACCEPTED"));
    }

    @Test
    @DisplayName("Should include pending collaborators in the list (200)")
    public void testGetCollaboratorsIncludesPending() {
        String[] owner = createUserWithToken("owner_get_p");
        String[] collaborator = createUserWithToken("collab_get_p");
        Long itineraryId = createItineraryAndGetId(owner[1]);

        sendInvitation(owner[1], itineraryId, collaborator[0], CollaboratorRoleDTO.VIEWER);

        RestAssured
            .given()
                .cookie("auth_token", owner[1])
            .when()
                .get("/v1/itineraries/{id}/collaborators", itineraryId)
            .then()
                .statusCode(200)
                .body("size()", equalTo(2))
                .body("[0].role", equalTo("OWNER"))
                .body("[1].status", equalTo("PENDING"));
    }

    @Test
    @DisplayName("Should fail when unauthorized user views collaborators (403)")
    public void testGetCollaboratorsForbidden() {
        String[] owner = createUserWithToken("owner_get_fo");
        String[] other = createUserWithToken("other_get_fo");
        Long itineraryId = createItineraryAndGetId(owner[1]);

        RestAssured
            .given()
                .cookie("auth_token", other[1])
            .when()
                .get("/v1/itineraries/{id}/collaborators", itineraryId)
            .then()
                .statusCode(403);
    }

    @Test
    @DisplayName("Accepted collaborator can view collaborators list (200)")
    public void testGetCollaboratorsCollaboratorCanView() {
        String[] owner = createUserWithToken("owner_get_cv");
        String[] collaborator = createUserWithToken("collab_get_cv");
        Long itineraryId = createItineraryAndGetId(owner[1]);

        sendInvitation(owner[1], itineraryId, collaborator[0], CollaboratorRoleDTO.VIEWER);
        acceptInvitation(collaborator[1], itineraryId, collaborator[0]);

        RestAssured
            .given()
                .cookie("auth_token", collaborator[1])
            .when()
                .get("/v1/itineraries/{id}/collaborators", itineraryId)
            .then()
                .statusCode(200)
                .body("size()", equalTo(2));
    }

    @Test
    @DisplayName("Should update role from VIEWER to EDITOR (200)")
    public void testUpdateCollaboratorRole() {
        String[] owner = createUserWithToken("owner_upd");
        String[] collaborator = createUserWithToken("collab_upd");
        Long itineraryId = createItineraryAndGetId(owner[1]);

        sendInvitation(owner[1], itineraryId, collaborator[0], CollaboratorRoleDTO.VIEWER);
        acceptInvitation(collaborator[1], itineraryId, collaborator[0]);

        RestAssured
            .given()
                .contentType(ContentType.JSON)
                .cookie("auth_token", owner[1])
                .body(new UpdateCollaboratorRequest(CollaboratorRoleDTO.EDITOR))
            .when()
                .put("/v1/itineraries/{id}/collaborators/{username}", itineraryId, collaborator[0])
            .then()
                .statusCode(200)
                .body("role", equalTo("EDITOR"));
    }

    @Test
    @DisplayName("Should fail when updating PENDING collaborator role (400)")
    public void testUpdateCollaboratorRolePendingFail() {
        String[] owner = createUserWithToken("owner_upd_p");
        String[] collaborator = createUserWithToken("collab_upd_p");
        Long itineraryId = createItineraryAndGetId(owner[1]);

        sendInvitation(owner[1], itineraryId, collaborator[0], CollaboratorRoleDTO.VIEWER);

        RestAssured
            .given()
                .contentType(ContentType.JSON)
                .cookie("auth_token", owner[1])
                .body(new UpdateCollaboratorRequest(CollaboratorRoleDTO.EDITOR))
            .when()
                .put("/v1/itineraries/{id}/collaborators/{username}", itineraryId, collaborator[0])
            .then()
                .statusCode(400);
    }

    @Test
    @DisplayName("Should fail when trying to assign OWNER role via update (400)")
    public void testUpdateCollaboratorRoleCannotAssignOwner() {
        String[] owner = createUserWithToken("owner_upd_or");
        String[] collaborator = createUserWithToken("collab_upd_or");
        Long itineraryId = createItineraryAndGetId(owner[1]);

        sendInvitation(owner[1], itineraryId, collaborator[0], CollaboratorRoleDTO.VIEWER);
        acceptInvitation(collaborator[1], itineraryId, collaborator[0]);

        RestAssured
            .given()
                .contentType(ContentType.JSON)
                .cookie("auth_token", owner[1])
                .body(new UpdateCollaboratorRequest(CollaboratorRoleDTO.OWNER))
            .when()
                .put("/v1/itineraries/{id}/collaborators/{username}", itineraryId, collaborator[0])
            .then()
                .statusCode(400);
    }

    @Test
    @DisplayName("Should fail when non-owner tries to update role (403)")
    public void testUpdateCollaboratorRoleForbidden() {
        String[] owner = createUserWithToken("owner_upd_fo");
        String[] collaborator = createUserWithToken("collab_upd_fo");
        Long itineraryId = createItineraryAndGetId(owner[1]);

        sendInvitation(owner[1], itineraryId, collaborator[0], CollaboratorRoleDTO.VIEWER);
        acceptInvitation(collaborator[1], itineraryId, collaborator[0]);

        RestAssured
            .given()
                .contentType(ContentType.JSON)
                .cookie("auth_token", collaborator[1])
                .body(new UpdateCollaboratorRequest(CollaboratorRoleDTO.EDITOR))
            .when()
                .put("/v1/itineraries/{id}/collaborators/{username}", itineraryId, collaborator[0])
            .then()
                .statusCode(403);
    }

    @Test
    @DisplayName("Should allow owner to remove an accepted collaborator (204)")
    public void testRemoveCollaboratorByOwner() {
        String[] owner = createUserWithToken("owner_rm");
        String[] collaborator = createUserWithToken("collab_rm");
        Long itineraryId = createItineraryAndGetId(owner[1]);

        sendInvitation(owner[1], itineraryId, collaborator[0], CollaboratorRoleDTO.VIEWER);
        acceptInvitation(collaborator[1], itineraryId, collaborator[0]);

        RestAssured
            .given()
                .cookie("auth_token", owner[1])
            .when()
                .delete("/v1/itineraries/{id}/collaborators/{username}", itineraryId, collaborator[0])
            .then()
                .statusCode(204);

        RestAssured
            .given()
                .cookie("auth_token", owner[1])
            .when()
                .get("/v1/itineraries/{id}/collaborators", itineraryId)
            .then()
                .statusCode(200)
                .body("size()", equalTo(1))
                .body("[0].role", equalTo("OWNER"));
    }

    @Test
    @DisplayName("Should allow collaborator to remove themselves (204)")
    public void testRemoveCollaboratorSelfRemoval() {
        String[] owner = createUserWithToken("owner_rm_s");
        String[] collaborator = createUserWithToken("collab_rm_s");
        Long itineraryId = createItineraryAndGetId(owner[1]);

        sendInvitation(owner[1], itineraryId, collaborator[0], CollaboratorRoleDTO.VIEWER);
        acceptInvitation(collaborator[1], itineraryId, collaborator[0]);

        RestAssured
            .given()
                .cookie("auth_token", collaborator[1])
            .when()
                .delete("/v1/itineraries/{id}/collaborators/{username}", itineraryId, collaborator[0])
            .then()
                .statusCode(204);
    }

    @Test
    @DisplayName("Should fail when a non-owner tries to remove another collaborator (403)")
    public void testRemoveCollaboratorForbidden() {
        String[] owner = createUserWithToken("owner_rm_fo");
        String[] collaborator1 = createUserWithToken("collab1_rm_fo");
        String[] collaborator2 = createUserWithToken("collab2_rm_fo");
        Long itineraryId = createItineraryAndGetId(owner[1]);

        sendInvitation(owner[1], itineraryId, collaborator1[0], CollaboratorRoleDTO.EDITOR);
        sendInvitation(owner[1], itineraryId, collaborator2[0], CollaboratorRoleDTO.VIEWER);
        acceptInvitation(collaborator1[1], itineraryId, collaborator1[0]);
        acceptInvitation(collaborator2[1], itineraryId, collaborator2[0]);

        RestAssured
            .given()
                .cookie("auth_token", collaborator1[1])
            .when()
                .delete("/v1/itineraries/{id}/collaborators/{username}", itineraryId, collaborator2[0])
            .then()
                .statusCode(403);
    }

    @Test
    @DisplayName("Should return pending invitations for the user (200)")
    public void testGetPendingInvitations() {
        String[] owner = createUserWithToken("owner_pi");
        String[] collaborator = createUserWithToken("collab_pi");
        Long itineraryId = createItineraryAndGetId(owner[1]);

        sendInvitation(owner[1], itineraryId, collaborator[0], CollaboratorRoleDTO.VIEWER);

        RestAssured
            .given()
                .cookie("auth_token", collaborator[1])
            .when()
                .get("/v1/users/{username}/invitations", collaborator[0])
            .then()
                .statusCode(200)
                .body("size()", equalTo(1))
                .body("[0].status", equalTo("PENDING"))
                .body("[0].itineraryId", equalTo(itineraryId.intValue()))
                .body("[0].itineraryTitle", notNullValue());
    }

    @Test
    @DisplayName("Should return empty list when no pending invitations (200)")
    public void testGetPendingInvitationsEmpty() {
        String[] collaborator = createUserWithToken("collab_pi_e");

        RestAssured
            .given()
                .cookie("auth_token", collaborator[1])
            .when()
                .get("/v1/users/{username}/invitations", collaborator[0])
            .then()
                .statusCode(200)
                .body("size()", equalTo(0));
    }

    @Test
    @DisplayName("Should fail when unauthenticated user requests invitations (401)")
    public void testGetPendingInvitationsUnauthorized() {
        String username = "unauth_inv_" + System.currentTimeMillis();

        RestAssured
            .given()
            .when()
                .get("/v1/users/{username}/invitations", username)
            .then()
                .statusCode(401);
    }

    @Test
    @DisplayName("Should fail when user does not exist (404)")
    public void testGetPendingInvitationsUserNotFound() {
        String[] collaborator = createUserWithToken("collab_pi_nf");
        String missingUser = "missing_user_" + System.currentTimeMillis();

        RestAssured
            .given()
                .cookie("auth_token", collaborator[1])
            .when()
                .get("/v1/users/{username}/invitations", missingUser)
            .then()
                .statusCode(404);
    }

    @Test
    @DisplayName("Should not include accepted invitations in pending list (200)")
    public void testGetPendingInvitationsExcludesAccepted() {
        String[] owner = createUserWithToken("owner_pi_ea");
        String[] collaborator = createUserWithToken("collab_pi_ea");
        Long itineraryId = createItineraryAndGetId(owner[1]);

        sendInvitation(owner[1], itineraryId, collaborator[0], CollaboratorRoleDTO.VIEWER);
        acceptInvitation(collaborator[1], itineraryId, collaborator[0]);

        RestAssured
            .given()
                .cookie("auth_token", collaborator[1])
            .when()
                .get("/v1/users/{username}/invitations", collaborator[0])
            .then()
                .statusCode(200)
                .body("size()", equalTo(0));
    }

    @Test
    @DisplayName("Should fail when another user views invitations (403)")
    public void testGetPendingInvitationsForbidden() {
        String[] collaborator = createUserWithToken("collab_pi_fo");
        String[] other = createUserWithToken("other_pi_fo");

        RestAssured
            .given()
                .cookie("auth_token", other[1])
            .when()
                .get("/v1/users/{username}/invitations", collaborator[0])
            .then()
                .statusCode(403);
    }

    @Test
    @DisplayName("Full flow: invite → accept → update role → remove")
    public void testFullCollaborationLifecycle() {
        String[] owner = createUserWithToken("owner_full");
        String[] collaborator = createUserWithToken("collab_full");
        Long itineraryId = createItineraryAndGetId(owner[1]);

        sendInvitation(owner[1], itineraryId, collaborator[0], CollaboratorRoleDTO.VIEWER);

        acceptInvitation(collaborator[1], itineraryId, collaborator[0]);

        RestAssured
            .given()
                .contentType(ContentType.JSON)
                .cookie("auth_token", owner[1])
                .body(new UpdateCollaboratorRequest(CollaboratorRoleDTO.EDITOR))
            .when()
                .put("/v1/itineraries/{id}/collaborators/{username}", itineraryId, collaborator[0])
            .then()
                .statusCode(200)
                .body("role", equalTo("EDITOR"));

        RestAssured
            .given()
                .cookie("auth_token", owner[1])
            .when()
                .delete("/v1/itineraries/{id}/collaborators/{username}", itineraryId, collaborator[0])
            .then()
                .statusCode(204);

        RestAssured
            .given()
                .cookie("auth_token", owner[1])
            .when()
                .get("/v1/itineraries/{id}/collaborators", itineraryId)
            .then()
                .statusCode(200)
                .body("size()", equalTo(1))
                .body("[0].role", equalTo("OWNER"));
    }

    @Test
    @DisplayName("Re-invitation after decline should succeed")
    public void testReInviteAfterDecline() {
        String[] owner = createUserWithToken("owner_reinv");
        String[] collaborator = createUserWithToken("collab_reinv");
        Long itineraryId = createItineraryAndGetId(owner[1]);

        sendInvitation(owner[1], itineraryId, collaborator[0], CollaboratorRoleDTO.VIEWER);

        RestAssured
            .given()
                .cookie("auth_token", collaborator[1])
            .when()
                .delete("/v1/itineraries/{id}/collaborators/{username}/decline", itineraryId, collaborator[0])
            .then()
                .statusCode(204);

        RestAssured
            .given()
                .contentType(ContentType.JSON)
                .cookie("auth_token", owner[1])
                .body(new AddCollaboratorRequest(collaborator[0], CollaboratorRoleDTO.EDITOR))
            .when()
                .post("/v1/itineraries/{id}/collaborators", itineraryId)
            .then()
                .statusCode(201)
                .body("role", equalTo("EDITOR"));
    }

    @Test
    @DisplayName("Re-invitation after removal should succeed")
    public void testReInviteAfterRemoval() {
        String[] owner = createUserWithToken("owner_reinv_rm");
        String[] collaborator = createUserWithToken("collab_reinv_rm");
        Long itineraryId = createItineraryAndGetId(owner[1]);

        sendInvitation(owner[1], itineraryId, collaborator[0], CollaboratorRoleDTO.VIEWER);
        acceptInvitation(collaborator[1], itineraryId, collaborator[0]);

        RestAssured
            .given()
                .cookie("auth_token", owner[1])
            .when()
                .delete("/v1/itineraries/{id}/collaborators/{username}", itineraryId, collaborator[0])
            .then()
                .statusCode(204);

        RestAssured
            .given()
                .contentType(ContentType.JSON)
                .cookie("auth_token", owner[1])
                .body(new AddCollaboratorRequest(collaborator[0], CollaboratorRoleDTO.EDITOR))
            .when()
                .post("/v1/itineraries/{id}/collaborators", itineraryId)
            .then()
                .statusCode(201);
    }

    private String[] createUserWithToken(String prefix) {
        String name = prefix + "_" + System.currentTimeMillis();
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
