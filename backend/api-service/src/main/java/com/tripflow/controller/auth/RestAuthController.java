package com.tripflow.controller.auth;

import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

import com.tripflow.dto.auth.AuthResponse;
import com.tripflow.dto.auth.AuthStatus;
import com.tripflow.dto.auth.ForgotPasswordRequest;
import com.tripflow.dto.auth.LoginRequest;
import com.tripflow.dto.auth.ResetPasswordOtpRequest;
import com.tripflow.dto.auth.ResendCodeRequest;
import com.tripflow.dto.auth.VerifyAccountRequest;
import com.tripflow.dto.user.RegisterUserRequest;
import com.tripflow.service.auth.AuthService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Endpoints for user authentication and authorization")
public class RestAuthController {
    private static final String REFRESH_TOKEN_COOKIE_NAME = "refresh_token";
    private final AuthService authService;

    public RestAuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    @Operation(
        summary = "User Registration Endpoint",
        description = "Registers a new user with the provided details."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "User registered successfully"),
        @ApiResponse(responseCode = "400", description = "User registration failed")
    })
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterUserRequest request) {
        AuthResponse response = authService.register(request);
        HttpStatusCode status = response.status() == AuthStatus.FAILURE
            ? HttpStatusCode.valueOf(400)
            : HttpStatusCode.valueOf(201);

        return ResponseEntity.status(status).body(response);
    }

    @PostMapping("/verify")
    @Operation(
        summary = "Account Verification Endpoint",
        description = "Verifies a user account using the provided code."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Account verified successfully"),
        @ApiResponse(responseCode = "400", description = "Account verification failed")
    })
    public ResponseEntity<AuthResponse> verify(HttpServletResponse response, @Valid @RequestBody VerifyAccountRequest request) {
        AuthResponse authResponse = authService.verify(response, request);
        HttpStatusCode status = authResponse.status() == AuthStatus.FAILURE
            ? HttpStatusCode.valueOf(400)
            : HttpStatusCode.valueOf(200);

        return ResponseEntity.status(status).body(authResponse);
    }

    @PostMapping("/resend-code")
    @Operation(
        summary = "Resend Verification Code",
        description = "Resends the verification code to the user's email."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Verification code sent successfully"),
        @ApiResponse(responseCode = "400", description = "Failed to resend verification code")
    })
    public ResponseEntity<AuthResponse> resendCode(@Valid @RequestBody ResendCodeRequest request) {
        AuthResponse response = authService.resendVerificationCode(request.username());
        HttpStatusCode status = response.status() == AuthStatus.FAILURE
            ? HttpStatusCode.valueOf(400)
            : HttpStatusCode.valueOf(200);

        return ResponseEntity.status(status).body(response);
    }

    @PostMapping("/login")
    @Operation(
        summary = "User Login Endpoint",
        description = "Authenticates a user and initiates a session."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "User logged in successfully"),
        @ApiResponse(responseCode = "401", description = "User login failed")
    })
    public ResponseEntity<AuthResponse> login(HttpServletResponse response, @Valid @RequestBody LoginRequest request) {
        AuthResponse authResponse = authService.login(response, request);
        HttpStatusCode status = authResponse.status() == AuthStatus.FAILURE
            ? HttpStatusCode.valueOf(401)
            : HttpStatusCode.valueOf(200);
        
        return ResponseEntity.status(status).body(authResponse);
    }

    @PostMapping("/logout")
    @Operation(
        summary = "User Logout Endpoint",
        description = "Logs out the authenticated user and terminates the session."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "User logged out successfully"),
        @ApiResponse(responseCode = "400", description = "User logout failed")
    })
    public ResponseEntity<AuthResponse> logout(HttpServletResponse response) {
        AuthResponse authResponse = authService.logout(response);
        HttpStatusCode status = authResponse.status() == AuthStatus.FAILURE
            ? HttpStatusCode.valueOf(400)
            : HttpStatusCode.valueOf(200);
        
        return ResponseEntity.status(status).body(authResponse);
    }

    @PostMapping("/refresh")
    @Operation(
        summary = "Token Refresh Endpoint",
        description = "Refreshes the authentication token using a valid refresh token."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Token refreshed successfully"),
        @ApiResponse(responseCode = "401", description = "Token refresh failed")
    })
    public ResponseEntity<AuthResponse> refresh(
        HttpServletResponse response,
        @CookieValue(name = REFRESH_TOKEN_COOKIE_NAME, required = true) String refreshToken
    ) {
        AuthResponse authResponse = authService.refresh(response, refreshToken);
        HttpStatusCode status = authResponse.status() == AuthStatus.FAILURE
            ? HttpStatusCode.valueOf(401)
            : HttpStatusCode.valueOf(200);
        
        return ResponseEntity.status(status).body(authResponse);
    }

    @PostMapping("/forgot-password")
    @Operation(
        summary = "Forgot Password Endpoint",
        description = "Sends a one-time code to reset account password."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Request processed")
    })
    public ResponseEntity<AuthResponse> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        AuthResponse authResponse = authService.forgotPassword(request);
        return ResponseEntity.status(HttpStatusCode.valueOf(200)).body(authResponse);
    }

    @PostMapping("/reset-password")
    @Operation(
        summary = "Reset Password with OTP",
        description = "Resets password using username/email, OTP code, and new password."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Password reset successful"),
        @ApiResponse(responseCode = "400", description = "Password reset failed")
    })
    public ResponseEntity<AuthResponse> resetPassword(
        HttpServletResponse response,
        @Valid @RequestBody ResetPasswordOtpRequest request
    ) {
        AuthResponse authResponse = authService.resetPasswordWithOtp(response, request);
        HttpStatusCode status = authResponse.status() == AuthStatus.FAILURE
            ? HttpStatusCode.valueOf(400)
            : HttpStatusCode.valueOf(200);

        return ResponseEntity.status(status).body(authResponse);
    }
}
