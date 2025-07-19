package com.tripflow.controller.auth;

import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tripflow.dto.auth.AuthResponse;
import com.tripflow.dto.auth.AuthStatus;
import com.tripflow.dto.user.RegisterUserRequest;
import com.tripflow.service.AuthService;

@RestController
@RequestMapping("/api/auth")
public class RestAuthController {
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
}