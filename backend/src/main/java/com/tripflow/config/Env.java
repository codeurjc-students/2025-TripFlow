package com.tripflow.config;

/**
 * Configuration class for environment variables.
 * This class retrieves environment variables using the DotenvConfig singleton.
 */
public class Env {
    public static final String JWT_SECRET = DotenvConfig.getInstance().getDotenv().get("JWT_SECRET");
}