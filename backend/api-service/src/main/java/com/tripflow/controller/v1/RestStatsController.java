package com.tripflow.controller.v1;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


import com.tripflow.dto.stats.UserStatsDTO;
import com.tripflow.dto.stats.UsersByPlanStatsDTO;
import com.tripflow.service.StatsService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;

@RestController
@RequestMapping("/api/v1/stats")
@Tag(name = "Statistics", description = "Endpoints for retrieving statistics")
public class RestStatsController {
    private final StatsService statsService;

    public RestStatsController(StatsService statsService) {
        this.statsService = statsService;
    }

    @GetMapping("/user")
    @Operation(
        summary = "Get User Statistics",
        description = "Retrieves statistics related to the authenticated user.",
        security = @SecurityRequirement(name = "auth_token")
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "User statistics retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized access"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<UserStatsDTO> getUserStats() throws Exception {
        UserStatsDTO stats = this.statsService.getUserStats();
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/users-by-plan")
    @Operation(
        summary = "Get Users By Plan Statistics",
        description = "Retrieves user distribution grouped by subscription plan. Admin only endpoint.",
        security = @SecurityRequirement(name = "auth_token")
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Users by plan statistics retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized access"),
        @ApiResponse(responseCode = "403", description = "Admin role required"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<UsersByPlanStatsDTO> getUsersByPlanStats() {
        UsersByPlanStatsDTO stats = this.statsService.getUsersByPlanStats();
        return ResponseEntity.ok(stats);
    }
}
