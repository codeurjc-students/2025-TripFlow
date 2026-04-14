package com.tripflow.utils;

import java.util.regex.Pattern;

public final class AIInputSanitizer {

    private AIInputSanitizer() { /* Prevent instantiation */ }

    // Patterns that attempt to override system instructions
    private static final Pattern ROLE_OVERRIDE_PATTERN = Pattern.compile(
        "(?i)(you are now|ignore (all )?previous|forget (all )?previous|"
        + "ignore (all )?instructions|forget (all )?instructions|"
        + "disregard (all )?previous|disregard (all )?instructions|"
        + "new instructions|system prompt|override instructions|"
        + "bypass (all )?instructions|act as|pretend to be|"
        + "you must now|from now on you are|jailbreak|DAN mode)"
    );

    // Markdown/code-fence delimiters that could be used to inject structured output
    private static final Pattern CODE_FENCE_PATTERN = Pattern.compile("```");

    // Excessive whitespace / newlines that might be used to visually separate injected content
    private static final Pattern EXCESSIVE_NEWLINES = Pattern.compile("\\n{3,}");

    private static final int MAX_USER_PROMPT_LENGTH = 1000;

    /**
     * Sanitizes user-provided free-text input intended for the LLM.
     *
     * @param input the raw user input
     * @return sanitized input safe to include as a user message
     */
    public static String sanitize(String input) {
        if (input == null || input.isBlank()) {
            return "";
        }

        String sanitized = input.strip();

        // Truncate to a reasonable length
        if (sanitized.length() > MAX_USER_PROMPT_LENGTH) {
            sanitized = sanitized.substring(0, MAX_USER_PROMPT_LENGTH);
        }

        // Remove role-override / injection patterns
        sanitized = ROLE_OVERRIDE_PATTERN.matcher(sanitized).replaceAll("[filtered]");

        // Remove code fences
        sanitized = CODE_FENCE_PATTERN.matcher(sanitized).replaceAll("");

        // Collapse excessive newlines
        sanitized = EXCESSIVE_NEWLINES.matcher(sanitized).replaceAll("\n\n");

        return sanitized.strip();
    }
}
