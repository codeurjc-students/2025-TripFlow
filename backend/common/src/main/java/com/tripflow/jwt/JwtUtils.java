package com.tripflow.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtParser;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

import javax.crypto.SecretKey;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class JwtUtils {
    private static final Logger log = LoggerFactory.getLogger(JwtUtils.class);

    private final SecretKey jwtSecretKey;
    private final JwtParser jwtParser;

    public JwtUtils(@Value("${jwt.secret}") String jwtSecret) {
        byte[] keyBytes = Decoders.BASE64.decode(jwtSecret);
        this.jwtSecretKey = Keys.hmacShaKeyFor(keyBytes);
        this.jwtParser = Jwts.parser().verifyWith(jwtSecretKey).build();
    }

    /**
     * Validates the JWT and returns the claims if valid.
     * 
     * @param token the JWT token to validate
     * @return the claims contained in the token
     */
    public Claims validateToken(String token) {
        return jwtParser.parseSignedClaims(token).getPayload();
    }

    /**
     * Returns if the token is valid (not expired and correctly signed).
     *
     * @param token the JWT token to check
     * @return true if the token is valid, false otherwise
     */
    public boolean isTokenValid(String token) {
        try {
            Claims claims = validateToken(token);
            return !isTokenExpired(claims);
        } catch (Exception e) {
            log.debug("JWT token validation failed", e);
            return false;
        }
    }

    private boolean isTokenExpired(Claims claims) {
        return claims.getExpiration() != null && claims.getExpiration().before(new java.util.Date());
    }


    /**
     * Returns the username (subject) from the JWT token.
     *
     * @param token the JWT token
     * @return the username contained in the token
     */
    public String getUsername(String token) {
        Claims claims = validateToken(token);
        return claims.getSubject();
    }

    public SecretKey getSecretKey() {
        return jwtSecretKey;
    }
}
