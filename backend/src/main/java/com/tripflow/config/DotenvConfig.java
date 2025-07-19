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
        boolean isCI = System.getenv("CI") != null || System.getenv("GITHUB_ACTIONS") != null;

        if (isCI) {
            // Load environment variables from the CI environment
            this.dotenv = Dotenv.configure()
                .ignoreIfMissing()
                .systemProperties()
                .load();
        } else {
            // Load environment variables from the .env file
            this.dotenv = Dotenv.configure().load();
        }
    }

    public static DotenvConfig getInstance() {
        if (instance == null) instance = new DotenvConfig();
        return instance;
    }

    public Dotenv getDotenv() {
        return dotenv;
    }
}
