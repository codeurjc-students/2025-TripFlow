package com.tripflow.controller.auth;

import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tripflow.dto.auth.AuthResponse;
import com.tripflow.dto.auth.AuthStatus;
import com.tripflow.dto.auth.LoginRequest;
import com.tripflow.dto.user.RegisterUserRequest;
import com.tripflow.service.AuthService;

import jakarta.servlet.http.HttpServletResponse;

@RestController
@RequestMapping("/api/auth")
public class RestAuthController {
    private static final String REFRESH_TOKEN_COOKIE_NAME = "refresh_token";
    private final AuthService authService;

    public RestAuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterUserRequest request) {
        AuthResponse response = authService.register(request);
        HttpStatusCode status = response.status() == AuthStatus.FAILURE
            ? HttpStatusCode.valueOf(400)
            : HttpStatusCode.valueOf(201);

        return ResponseEntity.status(status).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(HttpServletResponse response, @RequestBody LoginRequest request) {
        AuthResponse authResponse = authService.login(response, request);
        HttpStatusCode status = authResponse.status() == AuthStatus.FAILURE
            ? HttpStatusCode.valueOf(401)
            : HttpStatusCode.valueOf(200);
        
        return ResponseEntity.status(status).body(authResponse);
    }

    @PostMapping("/logout")
    public ResponseEntity<AuthResponse> logout(HttpServletResponse response) {
        AuthResponse authResponse = authService.logout(response);
        HttpStatusCode status = authResponse.status() == AuthStatus.FAILURE
            ? HttpStatusCode.valueOf(400)
            : HttpStatusCode.valueOf(200);
        
        return ResponseEntity.status(status).body(authResponse);
    }

    @PostMapping("/refresh")
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
}