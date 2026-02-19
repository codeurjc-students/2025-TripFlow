package com.tripflow.unit;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

import java.time.Instant;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;

import com.tripflow.dto.auth.AuthResponse;
import com.tripflow.dto.auth.AuthStatus;
import com.tripflow.dto.auth.LoginRequest;
import com.tripflow.dto.user.PublicUserDTO;
import com.tripflow.dto.user.RegisterUserRequest;
import com.tripflow.dto.user.VerificationCode;
import com.tripflow.exception.EmailAlreadyExistsException;
import com.tripflow.exception.UsernameAlreadyExistsException;
import com.tripflow.model.User;
import com.tripflow.dto.user.PlanTypeDTO;
import com.tripflow.dto.user.UserTypeDTO;
import com.tripflow.security.jwt.JwtTokenProvider;
import com.tripflow.service.KafkaService;
import com.tripflow.service.UserService;
import com.tripflow.service.auth.AuthService;
import com.tripflow.service.auth.AuthValidator;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.impl.DefaultClaimsBuilder;
import jakarta.servlet.http.HttpServletResponse;

@Tag("unit")
public class AuthServiceTest {
    private AuthenticationManager authenticationManager;
    private UserDetailsService userDetailsService;
    private JwtTokenProvider jwtTokenProvider;
    private UserService userService;
    private AuthValidator authValidator;
    private HttpServletResponse response;
    private AuthService authService;
    private KafkaService kafkaService;

    @BeforeEach
    public void setUp() {
        this.authenticationManager = mock(AuthenticationManager.class);
        this.userDetailsService = mock(UserDetailsService.class);
        this.jwtTokenProvider = mock(JwtTokenProvider.class);
        this.userService = mock(UserService.class);
        this.response = mock(HttpServletResponse.class);
        this.authValidator = new AuthValidator();
        this.kafkaService = mock(KafkaService.class);

        this.authService = new AuthService(
            authenticationManager, userDetailsService,
            jwtTokenProvider, userService, authValidator, kafkaService
        );
    }

    @Test
    @DisplayName("Test login successfully and set cookies")
    public void testLoginSuccess() {
        String username = "user";
        LoginRequest request = new LoginRequest(username, "pass");
        Authentication authentication = mock(Authentication.class);
        UserDetails userDetails = mock(UserDetails.class);
        PublicUserDTO publicUser = new PublicUserDTO(
            username, username, 
            "", "Earth", true, null, UserTypeDTO.USER, PlanTypeDTO.FREE
        );
        User user = mock(User.class);
        
        when(user.getVerified()).thenReturn(true);
        when(this.authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(authentication);
        when(this.userDetailsService.loadUserByUsername(username)).thenReturn(userDetails);
        when(this.userService.getPublicUserByUsername(username)).thenReturn(publicUser);
        when(this.jwtTokenProvider.generateAuthToken(userDetails)).thenReturn("authToken");
        when(this.jwtTokenProvider.generateRefreshToken(userDetails)).thenReturn("refreshToken");
        when(this.userService.getUserByUsername(username)).thenReturn(user);

        AuthResponse result = this.authService.login(response, request);

        assertEquals(AuthStatus.SUCCESS, result.status(), "Login should be successful");
        assertEquals(publicUser, result.user(), "User should be returned");
        assertEquals("Login successful", result.message());
        verify(this.response, times(2)).addHeader(anyString(), anyString());
    }

    @Test
    @DisplayName("Test login fails due to invalid credentials")
    public void testLoginFailure() {
        String username = "user";
        String password = "wrongpass";

        LoginRequest request = new LoginRequest(username, password);
        
        when(this.authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
            .thenThrow(new BadCredentialsException("Invalid credentials"));

        AuthResponse result = this.authService.login(response, request);

        assertEquals(AuthStatus.FAILURE, result.status(), "Login should fail due to invalid credentials");
        assertEquals(result.message(), "Invalid credentials");
        assertNull(result.user(), "User should not be returned on failure");
        verify(this.response, never()).addHeader(anyString(), anyString());
    }

    @Test
    @DisplayName("Test register fails due to validation errors")
    public void testRegisterValidationErrors() {
        String email = "invalid-email";
        String username = "12";
        RegisterUserRequest request = new RegisterUserRequest(email, username, "pass", "pass");

        AuthResponse result = this.authService.register(request);

        assertEquals(AuthStatus.FAILURE, result.status(), "Registration should fail due to validation errors");
        assertTrue(result.errors().containsKey("email"), "Email error should be present");
        assertTrue(result.errors().containsKey("username"), "Username error should be present");
        assertTrue(result.errors().containsKey("password"), "Password error should be present");

        verify(this.userService, never()).registerUser(any());
    }

    @Test
    @DisplayName("Test register successfully")
    public void testRegisterSuccess() {
        String email = "user@example.com";
        String username = "user";
        String password = "Abc12345678";

        RegisterUserRequest request = new RegisterUserRequest(email, username, password, password);
        PublicUserDTO publicUser = new PublicUserDTO(
            username, username, 
            "", "Earth", true, null, UserTypeDTO.USER, PlanTypeDTO.FREE
        );

        when(this.userService.registerUser(request)).thenReturn(publicUser);

        VerificationCode verificationCode = new VerificationCode("123456", Instant.now());
        when(this.userService.generateVerificationCode(email)).thenReturn(verificationCode);

        AuthResponse result = this.authService.register(request);

        assertNull(result.errors(), "No errors should be present in the response");
        assertEquals(AuthStatus.SUCCESS, result.status(), "Registration should be successful");
        assertEquals("Registration successful", result.message());
        assertEquals(publicUser, result.user());

        verify(this.userService, times(1)).registerUser(request);
        verify(this.userService, times(1)).generateVerificationCode(email);
        verifyNoMoreInteractions(this.userService);
    }

    @Test
    @DisplayName("Test register fails due to email already exists")
    public void testRegisterEmailAlreadyExists() {
        String email = "user@example.com";
        String username = "user";
        String password = "Abc12345678";
        RegisterUserRequest request = new RegisterUserRequest(email, username, password, password);

        when(this.userService.registerUser(request)).thenThrow(
            new EmailAlreadyExistsException("User already exists with email")
        );

        AuthResponse result = this.authService.register(request);

        assertEquals(AuthStatus.FAILURE, result.status());
        assertTrue(result.errors().containsKey("email"), "Email error should be present");
        assertEquals("User already exists with email", result.errors().get("email"));
    }

    @Test
    @DisplayName("Test register fails due to user already exists")
    public void testRegisterUserAlreadyExists() {
        String email = "user@example.com";
        String username = "user";
        String password = "Abc12345678";
        RegisterUserRequest request = new RegisterUserRequest(email, username, password, password);

        when(this.userService.registerUser(request)).thenThrow(
            new UsernameAlreadyExistsException("User already exists with username")
        );

        AuthResponse result = this.authService.register(request);

        assertEquals(AuthStatus.FAILURE, result.status());
        assertTrue(result.errors().containsKey("username"), "Username error should be present");
        assertEquals("User already exists with username", result.errors().get("username"));
        assertNull(result.user(), "User should not be returned on failure");

        verify(this.userService, times(1)).registerUser(request);
        verifyNoMoreInteractions(this.userService);
    }

    @Test
    @DisplayName("Test logout successfully")
    public void testLogout() {
        AuthResponse result = this.authService.logout(this.response);

        assertEquals(AuthStatus.SUCCESS, result.status());
        assertEquals("Logout successful", result.message());
        verify(this.response, times(2)).addHeader(anyString(), anyString());
    }

    @Test
    @DisplayName("Test refresh token successfully")
    public void testRefreshTokenSuccess() {
        String refreshToken = "valid-refresh-token";
        String newAuthToken = "new-auth-token";
        String username = "user";
        String password = "password";

        // Mock claims and user details
        Claims claims = new DefaultClaimsBuilder().setSubject(username).build();
        UserDetails userDetails = org.springframework.security.core.userdetails.User.builder()
            .username(username)
            .password(password)
            .roles("USER")
            .build();
        
        PublicUserDTO publicUser = new PublicUserDTO(
            username, username,
            "", "Earth", true, null, UserTypeDTO.USER, PlanTypeDTO.FREE
        );

        when(this.jwtTokenProvider.validateToken(refreshToken)).thenReturn(claims);
        when(this.userDetailsService.loadUserByUsername(username)).thenReturn(userDetails);
        when(this.jwtTokenProvider.generateAuthToken(userDetails)).thenReturn(newAuthToken);
        when(this.userService.getPublicUserByUsername(username)).thenReturn(publicUser);

        AuthResponse result = this.authService.refresh(this.response, refreshToken);

        assertEquals(AuthStatus.SUCCESS, result.status(), "Token refresh should be successful");
        assertEquals("Token refreshed successfully", result.message());
        assertEquals(publicUser, result.user());

        verify(this.response, times(1)).addHeader(anyString(), anyString());
        verify(this.jwtTokenProvider, times(1)).validateToken(refreshToken);
        verify(this.userDetailsService, times(1)).loadUserByUsername(username);
        verify(this.jwtTokenProvider, times(1)).generateAuthToken(userDetails);
        verify(this.userService, times(1)).getPublicUserByUsername(username);
    }

    @Test
    @DisplayName("Test refresh token fails due to invalid token")
    public void testRefreshTokenFailure() {
        String refreshToken = "invalid-refresh-token";

        when(this.jwtTokenProvider.validateToken(refreshToken))
            .thenThrow(new IllegalArgumentException("Invalid refresh token"));

        AuthResponse result = this.authService.refresh(this.response, refreshToken);

        assertEquals(AuthStatus.FAILURE, result.status());
        assertEquals("Invalid refresh token", result.message());
        assertNull(result.user());

        verify(this.response, never()).addHeader(anyString(), anyString());
        verify(this.jwtTokenProvider, times(1)).validateToken(refreshToken);
        verifyNoMoreInteractions(this.userDetailsService);
        verifyNoMoreInteractions(this.jwtTokenProvider);
        verifyNoMoreInteractions(this.userService);
    }
}