package com.tripflow.service;

import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import com.tripflow.kafka.messages.AIRequestMessage;
import com.tripflow.kafka.messages.CollaborationEventMessage;
import com.tripflow.kafka.messages.EmailMessage;
import com.tripflow.kafka.messages.NotificationMessage;

@Service
public class KafkaService {
    private final KafkaTemplate<String, Object> kafkaTemplate;

    public KafkaService(KafkaTemplate<String, Object> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    private void sendMessage(String topic, Object message) {
        kafkaTemplate.send(topic, message);
    }

    /**
     * Sends an AI request message to the "ai-request" topic.
     * 
     * @param message The AIRequestMessage to be sent.
     */
    public void sendAIRequestMessage(AIRequestMessage message) {
        this.sendMessage("ai-request", message);
    }

    /**
     * Sends a Notification message to the "notification" topic.
     * 
     * @param message The NotificationMessage to be sent.
     */
    public void sendNotificationMessage(NotificationMessage message) {
        this.sendMessage("notification", message);
    }

    /**
     * Sends a Collaboration event message to the "collaboration" topic.
     *
     * @param message The CollaborationEventMessage to be sent.
     */
    public void sendCollaborationEventMessage(CollaborationEventMessage message) {
        this.sendMessage("collaboration", message);
    }

    /**
     * Sends an Email message to the "email" topic.
     * 
     * @param message The EmailMessage to be sent.
     */
    public void sendEmailMessage(EmailMessage message) {
        this.sendMessage("email", message);
    }
}
