package com.tripflow.config;

import io.github.cdimascio.dotenv.Dotenv;

/**
 * Singleton configuration class for Dotenv.
 * This class loads environment variables from a .env file using the Dotenv library.
 */
public class DotenvConfig {
    private static DotenvConfig instance;
    private Dotenv dotenv;

    private DotenvConfig() {
        this.dotenv = Dotenv.configure().load();
    }

    public static DotenvConfig getInstance() {
        if (instance == null) instance = new DotenvConfig();
        return instance;
    }

    public Dotenv getDotenv() {
        return dotenv;
    }
}
