package com.tripflow.controller.v1;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tripflow.dto.ai.AIGenerationRequest;
import com.tripflow.dto.ai.AIResponse;
import com.tripflow.dto.ai.AIStatus;
import com.tripflow.service.ai.AIService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;

@RestController
@RequestMapping("/api/v1/ai")
@Tag(name = "AI Generation", description = "AI generation and processing")
public class RestAIController {
    private final AIService aiService;

    public RestAIController(AIService aiService) {
        this.aiService = aiService;
    }

    @GetMapping("/status")
    @Operation(
        summary = "Get AI Status",
        description = "Retrieves the AI status for the authenticated user.",
        security = @SecurityRequirement(name = "auth_token")
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "AI status retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized access"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<AIStatus> getAIStatus() {
        AIStatus aiStatus = this.aiService.getAIStatus();
        return ResponseEntity.ok(aiStatus);
    }
    
    @PostMapping
    @Operation(
        summary = "Submit AI Processing Request",
        description = "Submits a request for AI processing based on user preferences.",
        security = @SecurityRequirement(name = "auth_token")
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "AI request submitted successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized access"),
        @ApiResponse(responseCode = "429", description = "Too many requests - daily AI usage limit exceeded"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<AIResponse> handleAIRequest(@Valid @RequestBody AIGenerationRequest request) throws Exception {
        AIResponse response = this.aiService.requestAIProcessing(request);
        return ResponseEntity.ok(response);
    }
}