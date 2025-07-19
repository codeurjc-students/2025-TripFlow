package com.tripflow.service.auth;

import java.util.Map;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;

import com.tripflow.dto.auth.AuthResponse;
import com.tripflow.dto.auth.AuthStatus;
import com.tripflow.dto.auth.LoginRequest;
import com.tripflow.dto.user.PublicUserDTO;
import com.tripflow.dto.user.RegisterUserRequest;
import com.tripflow.security.jwt.JwtTokenProvider;
import com.tripflow.security.jwt.TokenType;
import com.tripflow.service.UserService;

import io.jsonwebtoken.Claims;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;

@Service
public class AuthService {
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserService userService;
    private final AuthValidator authValidator;

    public AuthService(
        AuthenticationManager authenticationManager, UserDetailsService userDetailsService,
        JwtTokenProvider jwtTokenProvider, UserService userService, AuthValidator authValidator
    ) {
        this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService;
        this.jwtTokenProvider = jwtTokenProvider;
        this.userService = userService;
        this.authValidator = authValidator;
    }

    /**
     * Handles user registration by creating a new user.
     * 
     * @param request  the register request containing user details
     * @return an AuthResponse containing the status, message, errors, and public user information
     */
    public AuthResponse register(RegisterUserRequest request) {
        // Validate the registration request
        Map<String, String> errors = this.authValidator.validateUserRegistrationRequest(request);

        // If there are validation errors, return them in the response
        if (!errors.isEmpty()) {
            return new AuthResponse(
                AuthStatus.FAILURE,
                null,
                errors,
                null
            );
        }

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

    /**
     * Handles user login by authenticating the user and generating JWT tokens.
     *
     * @param response the HTTP response to add cookies to
     * @param request  the login request containing username and password
     * @return an AuthResponse containing the status, message, and public user information
     */
    public AuthResponse login(HttpServletResponse response, LoginRequest request) {
        // Try to authenticate the user
        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.username(), request.password())
            );
        } catch (AuthenticationException e) {
            return new AuthResponse(
                AuthStatus.FAILURE,
                "Invalid credentials",
                null,
                null
            );
        }

        // Set the authentication in the security context
		SecurityContextHolder.getContext().setAuthentication(authentication);

        // Retrieve user details and public user information
        String username = request.username();
        UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);
        PublicUserDTO publicUser = this.userService.getPublicUserByUsername(username);

        // Add the JWT token to the response as a Read-Only Cookie
        String newAuthToken = this.jwtTokenProvider.generateAuthToken(userDetails);
        String newRefreshToken = this.jwtTokenProvider.generateRefreshToken(userDetails);

        response.addCookie(this.buildTokenCookie(TokenType.AUTH_TOKEN, newAuthToken));
        response.addCookie(this.buildTokenCookie(TokenType.REFRESH_TOKEN, newRefreshToken));

        return new AuthResponse(
            AuthStatus.SUCCESS,
            "Login successful",
            null,
            publicUser
        );
    }

    /**
     * Handles user logout by clearing the authentication and removing tokens.
     *
     * @param response the HTTP response to add cookies to
     * @return an AuthResponse indicating the logout status
     */
    public AuthResponse logout(HttpServletResponse response) {
        // Clear the authentication from the security context
        SecurityContextHolder.clearContext();

        response.addCookie(this.removeTokenFromCookie(TokenType.AUTH_TOKEN));
        response.addCookie(this.removeTokenFromCookie(TokenType.REFRESH_TOKEN));

        return new AuthResponse(
            AuthStatus.SUCCESS,
            "Logout successful",
            null,
            null
        );
    }

    /**
     * Refreshes the authentication tokens.
     *
     * @param response the HTTP response to add cookies to
     * @param refreshToken the refresh token from the request for validation
     * @return an AuthResponse containing the new token and public user information
     */
    public AuthResponse refresh(HttpServletResponse response, String refreshToken) {
        try {
            Claims claims = this.jwtTokenProvider.validateToken(refreshToken);
            String username = claims.getSubject();

            // Generate new tokens using the JWT token provider
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);
            String newAuthToken = this.jwtTokenProvider.generateAuthToken(userDetails);

            // Add the new auth token to the response as a Read-Only Cookie
            response.addCookie(this.buildTokenCookie(TokenType.AUTH_TOKEN, newAuthToken));

            // Retrieve public user information
            PublicUserDTO publicUser = this.userService.getPublicUserByUsername(username);

            return new AuthResponse(
                AuthStatus.SUCCESS,
                "Token refreshed successfully",
                null,
                publicUser
            );
        } catch (Exception e) {
            return new AuthResponse(
                AuthStatus.FAILURE,
                "Invalid refresh token",
                Map.of("error", "Refresh token is invalid"),
                null
            );
        }
    }

    // [Private Methods] ================================================================

    private Cookie buildTokenCookie(TokenType type, String token) {
        Cookie cookie = new Cookie(type.getCookieName(), token);
        cookie.setMaxAge((int) type.getDuration().getSeconds());
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        return cookie;
    }

    private Cookie removeTokenFromCookie(TokenType type) {
        Cookie cookie = new Cookie(type.getCookieName(), "");
        cookie.setMaxAge(0);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        return cookie;
    }
}
