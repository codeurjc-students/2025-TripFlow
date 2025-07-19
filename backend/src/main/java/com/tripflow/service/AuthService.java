package com.tripflow.service;

import java.util.Map;

import org.springframework.stereotype.Service;

import com.tripflow.dto.auth.AuthResponse;
import com.tripflow.dto.auth.AuthStatus;
import com.tripflow.dto.user.PublicUserDTO;
import com.tripflow.dto.user.RegisterUserRequest;

@Service
public class AuthService {
    private final UserService userService;

    public AuthService(UserService userService) {
        this.userService = userService;
    }

    /**
     * Handles user registration by creating a new user.
     * 
     * @param request  the register request containing user details
     * @return an AuthResponse containing the status, message, and public user information
     */
    public AuthResponse register(RegisterUserRequest request) {
        try {
            // Try to register the user
            PublicUserDTO publicUser = this.userService.registerUser(request);

            return new AuthResponse(
                AuthStatus.SUCCESS,
                "Registration successful",
                null,
                publicUser
            );
        } catch (IllegalArgumentException e) {
            return new AuthResponse(
                AuthStatus.FAILURE,
                null,
                Map.of("username", "User already exists with username"),
                null
            );
        } catch (Exception e) {
            return new AuthResponse(
                AuthStatus.FAILURE,
                null,
                Map.of("unexpected", "An error occurred during registration"),
                null
            );
        }
    }
}
