package com.tripflow.utils;

import java.util.Map;

import com.tripflow.kafka.messages.EmailType;
import java.io.IOException;
import org.springframework.core.io.ClassPathResource;
import java.nio.charset.StandardCharsets;

public class EmailUtils {
    private EmailUtils() {}

    /**
     * Gets the email subject for the given email type.
     * 
     * @param type the type of email
     * @return the email subject
     */
    public static String getEmailSubject(EmailType type) {
        switch (type) {
            case VERIFICATION:
                return "Verificación de Cuenta TripFlow";
            case PASSWORD_RESET_OTP:
                return "Recupera tu contraseña en TripFlow";
            default:
                throw new IllegalArgumentException("Unsupported email type: " + type);
        }
    }

    /**
     * Generates the email body for the given email type and variables.
     * 
     * @param type the type of email to generate
     * @param variables the variables to replace in the template
     * @return the generated HTML body
     */
    public static String generateEmailBody(EmailType type, Map<String, String> variables) {
        String template = getTemplate(type);
        return processTemplate(template, variables);
    }

    private static String getTemplate(EmailType type) {
        String templateName;
        switch (type) {
            case VERIFICATION:
                templateName = "verification.html";
                break;
            case PASSWORD_RESET_OTP:
                templateName = "password-reset-otp.html";
                break;
            default:
                throw new IllegalArgumentException("Unsupported email type: " + type);
        }

        try {
            ClassPathResource resource = new ClassPathResource("templates/email/" + templateName);
            return new String(resource.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new RuntimeException("Error reading email template: " + templateName, e);
        }
    }

    private static String processTemplate(String htmlTemplate, Map<String, String> variables) {
        String processedHtml = htmlTemplate;

        for (Map.Entry<String, String> entry : variables.entrySet()) {
            String placeholder = "{{" + entry.getKey() + "}}";
            String value = entry.getValue();
            processedHtml = processedHtml.replace(placeholder, value);
        }

        return processedHtml;
    }
}
