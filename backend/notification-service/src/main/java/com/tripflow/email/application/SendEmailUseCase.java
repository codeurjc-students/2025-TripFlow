package com.tripflow.email.application;

import org.springframework.beans.factory.annotation.Value;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.tripflow.email.domain.EmailMessage;
import com.tripflow.email.domain.EmailService;

import org.springframework.stereotype.Service;

@Service
public class SendEmailUseCase {
    private static final Logger log = LoggerFactory.getLogger(SendEmailUseCase.class);

    private final EmailService emailService;

    @Value("${spring.profiles.active}")
    private String activeProfile;

    public SendEmailUseCase(EmailService emailService) {
        this.emailService = emailService;
    }

    /**
     * Sends an email with the given parameters.
     * 
     * @param email the email
     * @throws IllegalArgumentException if the email is invalid
     */
    public void execute(EmailMessage email) {
        if ("dev".equals(this.activeProfile)) {
            log.info("Simulated email send in dev profile. to={}, subject={}", email.to(), email.subject());
            return;
        }
        
        this.validateEmail(email);
        this.emailService.sendEmail(email);
    }

    /**
     * Validate the email.
     * 
     * @param email the email to validate
     * @throws IllegalArgumentException if the email is invalid
     */
    private void validateEmail(EmailMessage email) {
        if (email.to() == null || email.to().isEmpty()) {
            throw new IllegalArgumentException("Email address is required");
        }

        if (email.subject() == null || email.subject().isEmpty()) {
            throw new IllegalArgumentException("Email subject is required");
        }

        if (email.body() == null || email.body().isEmpty()) {
            throw new IllegalArgumentException("Email body is required");
        }
    }
}
