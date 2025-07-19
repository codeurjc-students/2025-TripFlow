package com.tripflow.unit;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.Collection;
import java.util.Date;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;

import com.tripflow.security.jwt.JwtTokenProvider;
import com.tripflow.security.jwt.TokenType;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.MalformedJwtException;

@Tag("unit")
public class JwtTest {
    private static final String JWT_SECRET = "dGVzdC1zZWNyZXQta2V5LWZvci1qd3QtdG9rZW4tdGVzdGluZy1wdXJwb3Nlcy1vbmx5";
    private static final String USERNAME = "testuser";

    private JwtTokenProvider jwtTokenProvider;
    private UserDetails userDetails;
    private HttpServletRequest request;

    @BeforeEach
    public void setUp() {
        System.setProperty("JWT_SECRET", JWT_SECRET);

        // Create an instance of JwtTokenProvider (JWT_SECRET is set in the system
        // properties)
        this.jwtTokenProvider = new JwtTokenProvider();

        // Mock UserDetails for testing
        Collection<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_USER"));
        this.userDetails = new User(USERNAME, "password", authorities);

        // Mock HttpServletRequest
        this.request = mock(HttpServletRequest.class);
    }

    @Test
    @DisplayName("Test invalid JWT Token Validation")
    public void testInvalidTokenValidation() {
        String invalidToken = "invalid.token.here";

        assertThrows(
            MalformedJwtException.class,
            () -> this.jwtTokenProvider.validateToken(invalidToken),
            "Expected MalformedJwtException for invalid token"
        );
    }

    @Test
    @DisplayName("Test empty JWT Token Validation")
    public void testEmptyTokenValidation() {
        String emptyToken = "";

        assertThrows(
            IllegalArgumentException.class,
            () -> this.jwtTokenProvider.validateToken(emptyToken),
            "Expected IllegalArgumentException for empty token"
        );
    }

    @Test
    @DisplayName("Test null JWT Token Validation")
    public void testNullTokenValidation() {
        assertThrows(
            IllegalArgumentException.class,
            () -> this.jwtTokenProvider.validateToken((String) null),
            "Expected IllegalArgumentException for null token"
        );
    }

    @Test
    @DisplayName("Test Auth Token Generation")
    public void testAuthTokenGeneration() {
        String token = this.jwtTokenProvider.generateAuthToken(this.userDetails);

        this.assertTokenStructure(token);
        this.assertTokenClaims(token, TokenType.AUTH_TOKEN);
    }

    @Test
    @DisplayName("Test Refresh Token Generation")
    public void testRefreshTokenGeneration() {
        String token = this.jwtTokenProvider.generateRefreshToken(this.userDetails);

        this.assertTokenStructure(token);
        this.assertTokenClaims(token, TokenType.REFRESH_TOKEN);
    }

    @Test
    @DisplayName("Test tokens have different expiration times")
    public void testTokenExpirationTimes() {
        String authToken = this.jwtTokenProvider.generateAuthToken(this.userDetails);
        String refreshToken = this.jwtTokenProvider.generateRefreshToken(this.userDetails);

        Claims authClaims = this.jwtTokenProvider.validateToken(authToken);
        Claims refreshClaims = this.jwtTokenProvider.validateToken(refreshToken);

        assertTrue(
            authClaims.getExpiration().before(refreshClaims.getExpiration()),
            "Auth token should expire before refresh token"
        );
    }

    @Test
    @DisplayName("Test getting token from cookies and return its value")
    public void testGetTokenFromCookiesAndReturnValue() {
        String token = this.jwtTokenProvider.generateAuthToken(this.userDetails);
        String cookieName = TokenType.AUTH_TOKEN.getCookieName();

        // Mock the request to return a cookie with the token
        Cookie[] cookies = { new Cookie(cookieName, token) };
        when(this.request.getCookies()).thenReturn(cookies);

        String tokenFromCookies = this.jwtTokenProvider.getTokenFromCookies(
            this.request,
            TokenType.AUTH_TOKEN
        );

        assertNotNull(tokenFromCookies, "Token should not be null");
        assertEquals(token, tokenFromCookies, "Token from cookies should match generated token");
    }

    @Test
    @DisplayName("Test getting token from cookies when no cookie is present")
    public void testGetTokenFromCookiesWhenNoCookiePresent() {
        // Mock the request to return no cookies
        when(this.request.getCookies()).thenReturn(null);

        String tokenFromCookies = this.jwtTokenProvider.getTokenFromCookies(
            this.request,
            TokenType.AUTH_TOKEN
        );

        assertNull(tokenFromCookies, "Token should be null when no cookie is present");
    }

    @Test
    @DisplayName("Test getting token from cookies with no matching cookie")
    public void testGetTokenFromCookiesWithNoMatchingCookie() {
        // Mock the request to return a cookie with a different name
        Cookie[] cookies = { new Cookie("other_cookie", "some_value") };
        when(this.request.getCookies()).thenReturn(cookies);

        String tokenFromCookies = this.jwtTokenProvider.getTokenFromCookies(
            this.request,
            TokenType.AUTH_TOKEN
        );

        assertNull(tokenFromCookies, "Token should be null when no matching cookie is present");
    }

    // [Helper Methods] ===============================================

    /**
     * Asserts that the token has the correct JWT structure
     */
    private void assertTokenStructure(String token) {
        assertNotNull(token, "Token should not be null");
        assertFalse(token.isEmpty(), "Token should not be empty");
        assertTrue(token.contains("."), "Token should have JWT format (header.payload.signature)");
    }

    /**
     * Asserts that the token claims are correct for the given token type
     */
    private void assertTokenClaims(String token, TokenType expectedType) {
        Claims claims = this.jwtTokenProvider.validateToken(token);

        assertEquals(USERNAME, claims.getSubject(),
                "Token subject should match the username");

        assertEquals(expectedType.getCookieName(), claims.get("type"),
                String.format("Token type should be %s", expectedType.getCookieName()));

        assertNotNull(claims.get("roles"), "Token should contain roles");

        assertTokenTimestamps(claims);
    }

    /**
     * Asserts that the token timestamps are valid
     */
    private void assertTokenTimestamps(Claims claims) {
        Date now = new Date();
        Date futureTime = new Date(System.currentTimeMillis() + 1000);

        assertTrue(claims.getExpiration().after(now),
                "Token expiration should be in the future");

        assertTrue(claims.getIssuedAt().before(futureTime),
                "Token issued at should be before current time");
    }
}
