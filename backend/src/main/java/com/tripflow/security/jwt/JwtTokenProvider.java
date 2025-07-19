package com.tripflow.security.jwt;

import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import com.tripflow.config.Env;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtBuilder;
import io.jsonwebtoken.JwtParser;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;

@Component
public class JwtTokenProvider {
    private final SecretKey JWT_SECRET_KEY;
    private final JwtParser jwtParser;

    public JwtTokenProvider() {
        byte[] keyBytes = Decoders.BASE64.decode(Env.JWT_SECRET);
        this.JWT_SECRET_KEY = Keys.hmacShaKeyFor(keyBytes);
        this.jwtParser = Jwts.parser().verifyWith(JWT_SECRET_KEY).build();
    }

    /**
     * Parses the JWT token from the Cookies of the request.
     * 
     * @param request the HTTP request containing the JWT token in cookies
     * @param tokenType the type of token to retrieve (e.g., ACCESS, REFRESH)
     * @return the JWT token as a String, or null if not found
     */
    public String getTokenFromCookies(HttpServletRequest request, TokenType tokenType) {
        Cookie[] cookies = request.getCookies();
        String cookieName = tokenType.getCookieName();
        if (cookies == null) return null;

        for (Cookie cookie : cookies) {
            if (cookieName.equals(cookie.getName())) {
                return cookie.getValue();
            }
        }

        return null;
    }

    /**
     * Validates the JWT token and returns its claims.
     * 
     * @param token the JWT token to validate
     * @return the claims contained in the token if valid, otherwise throws an exception
     */
    public Claims validateToken(HttpServletRequest request) {
        String token = getTokenFromCookies(request, TokenType.AUTH_TOKEN);
        if (token == null) throw new IllegalArgumentException("Token not found in cookies");

        return this.validateToken(token);
    }

    /**
     * Validates the JWT token and returns its claims.
     * 
     * @param token the JWT token to validate
     * @return the claims contained in the token if valid, otherwise throws an exception
     */
    public Claims validateToken(String token) {
		return jwtParser.parseSignedClaims(token).getPayload();
	}

    /**
     * Generates an Auth token for the given user details.
     * 
     * @param userDetails the user details to include in the token
     * @return the generated JWT token as a String
     */
    public String generateAuthToken(UserDetails userDetails) {
        return this.buildToken(TokenType.AUTH_TOKEN, userDetails);
    }

    /**
     * Generates a refresh token for the given user details.
     * 
     * @param userDetails the user details to include in the refresh token
     * @return the generated refresh token as a String
     */
    public String generateRefreshToken(UserDetails userDetails) {
        return this.buildToken(TokenType.REFRESH_TOKEN, userDetails);
    }

    // [Private Methods] ==================================================

    /**
     * Generates a JWT token for the given user details and token type.
     * 
     * @param tokenType the type of token to generate (e.g., AUTH, REFRESH)
     * @param userDetails the user details to include in the token
     * @return the generated JWT token as a String
     */
    private String buildToken(TokenType tokenType, UserDetails userDetails) {
		Date currentDate = new Date();
		Date expiryDate = Date.from(new Date().toInstant().plus(tokenType.getDuration()));

		JwtBuilder builder = Jwts.builder()
            .claim("roles", userDetails.getAuthorities())
            .claim("type", tokenType.getCookieName())
            .subject(userDetails.getUsername())
            .issuedAt(currentDate)
            .expiration(expiryDate)
            .signWith(JWT_SECRET_KEY);
        
        return builder.compact();
	}
}
