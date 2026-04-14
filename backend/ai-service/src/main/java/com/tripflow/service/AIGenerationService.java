package com.tripflow.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.openai.client.OpenAIClient;
import com.openai.models.chat.completions.ChatCompletion;
import com.openai.models.chat.completions.ChatCompletionCreateParams;
import com.tripflow.dto.ai.AIGenerationRequest;
import com.tripflow.dto.itinerary.ExtendedItineraryDTO;
import com.tripflow.util.ItinerarySanitizer;
import com.tripflow.utils.AIItineraryMock;
import com.tripflow.utils.AIItineraryPrompt;
import com.tripflow.utils.AIPromptResult;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class AIGenerationService {
    @Value("${ai.api.model}")
    private String apiModel;

    @Value("${spring.profiles.active}")
    private String activeProfile;
    
    private final OpenAIClient openAIClient;

    public AIGenerationService(OpenAIClient openAIClient) {
        this.openAIClient = openAIClient;
    }


    /**
     * Generates an itinerary using the AI model.
     * 
     * @param request the request containing the itinerary details
     * @return an ExtendedItineraryDTO object containing the generated itinerary
     * @throws JsonProcessingException if there is an error processing the JSON response
     */
    public ExtendedItineraryDTO generateItinerary(AIGenerationRequest request) throws JsonProcessingException {
        if ("dev".equals(activeProfile)) {
            try {
                Thread.sleep(2000);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
            return AIItineraryMock.getItineraryMock();
        }

        AIPromptResult prompt = AIItineraryPrompt.generatePrompt(request);
        ChatCompletion chatCompletion = this.createChat(prompt);
        String response = chatCompletion
            .choices().get(0).message().content().get()
            .replace("```json", "")
            .replace("```", "");

        ObjectMapper objectMapper = new ObjectMapper();
        ExtendedItineraryDTO parsed = objectMapper.readValue(response, ExtendedItineraryDTO.class);
        return ItinerarySanitizer.sanitizeExtendedItinerary(parsed);
    }

    /**
     * Creates a chat completion using separate system and user message roles.
     * This prevents prompt injection by ensuring user input cannot override
     * the system-level instructions.
     * 
     * @param prompt the structured prompt containing system and user messages
     * @return a ChatCompletion object containing the AI's response
     */
    private ChatCompletion createChat(AIPromptResult prompt) {
        ChatCompletionCreateParams params = ChatCompletionCreateParams.builder()
            .addSystemMessage(prompt.systemMessage())
            .addUserMessage(prompt.userMessage())
            .model(this.apiModel)
            .build();
        return this.openAIClient.chat().completions().create(params);
    }
}
