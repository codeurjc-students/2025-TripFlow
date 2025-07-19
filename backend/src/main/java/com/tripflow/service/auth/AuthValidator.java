package com.tripflow.service.auth;

import org.springframework.stereotype.Component;

import com.tripflow.dto.user.RegisterUserRequest;
import java.util.HashMap;
import java.util.Map;

@Component
public class AuthValidator {
    private static final String USERNAME_REGEX = "^[a-zA-Z0-9_]+$";
    private static final String PASSWORD_REGEX = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d]{8,}$";
    private static final int MAX_USERNAME_LENGTH = 30;
    private static final int MIN_USERNAME_LENGTH = 3;
    private static final int MIN_PASSWORD_LENGTH = 8;

    /**
     * Validates the user registration request and returns a map of field errors.
     *
     * @param request the RegisterUserRequest containing user data
     * @return Map with field errors, empty if valid
     */
    public Map<String, String> validateUserRegistrationRequest(RegisterUserRequest request) {
        Map<String, String> errors = new HashMap<>();
        String key;

        // Username validation
        String username = request.username();
        key = "username";
        
        if (username == null || username.trim().isEmpty()) {
            errors.put(key, "Username is required.");
        } else if (username.length() < MIN_USERNAME_LENGTH || username.length() > MAX_USERNAME_LENGTH) {
            errors.put(key, "Username must be between 3 and 30 characters.");
        } else if (!username.matches(USERNAME_REGEX)) {
            errors.put(key, "Username can only contain letters, numbers, and underscores.");
        }

        // Password validation
        String password = request.password();
        key = "password";

        if (password == null || password.isEmpty()) {
            errors.put(key, "Password is required.");
        } else if (password.length() < MIN_PASSWORD_LENGTH) {
            errors.put(key, "Password must be at least 8 characters long.");
        } else if (!password.matches(PASSWORD_REGEX)) {
            errors.put(key, "Password must contain at least one uppercase letter, one lowercase letter, and one number.");
        } else if (!password.equals(request.confirmPassword())) {
            errors.put(key, "Password and confirmation do not match.");
        }

        return errors;
    }
}