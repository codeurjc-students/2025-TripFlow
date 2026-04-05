package com.tripflow.service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.tripflow.dto.stats.StatDTO;
import com.tripflow.dto.stats.UserStatsDTO;
import com.tripflow.dto.stats.UsersByPlanItemDTO;
import com.tripflow.dto.stats.UsersByPlanStatsDTO;
import com.tripflow.model.types.PlanType;
import com.tripflow.model.types.UserType;
import com.tripflow.repository.UserRepository;
import com.tripflow.model.User;
import com.tripflow.service.itinerary.ActivityService;
import com.tripflow.service.itinerary.ItineraryService;

@Service
public class StatsService {
    private final UserService userService;
    private final UserRepository userRepository;
    private final ItineraryService itineraryService;
    private final ActivityService activityService;

    public StatsService(
        UserService userService,
        UserRepository userRepository,
        ItineraryService itineraryService,
        ActivityService activityService
    ) {
        this.userService = userService;
        this.userRepository = userRepository;
        this.itineraryService = itineraryService;
        this.activityService = activityService;
    }

    /**
     * Retrieves statistics for the authenticated user.
     *
     * @return UserStatsDTO containing various user statistics
     */
    public UserStatsDTO getUserStats() {
        User user = userService.getAuthenticatedUser();

        if (user == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated");
        }

        Long userId = user.getId();

        Long activities = this.activityService.countActivitiesByUserId(userId);
        Long placesVisited = this.itineraryService.countDistinctLocationsByUserId(userId);
        Long totalDays = this.itineraryService.countTotalDaysByUserId(userId);

        return new UserStatsDTO(List.of(
            new StatDTO("activities", activities),
            new StatDTO("places_visited", placesVisited),
            new StatDTO("total_days", totalDays)
        ));
    }

    public UsersByPlanStatsDTO getUsersByPlanStats() {
        User authenticatedUser = userService.getAuthenticatedUser();

        if (authenticatedUser == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated");
        }

        if (authenticatedUser.getRole() != UserType.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin role required");
        }

        List<Object[]> rows = userRepository.countUsersByPlan();

        Map<PlanType, Long> countByPlan = rows.stream()
            .map(row -> {
                PlanType plan = (PlanType) row[0];
                Long count = (Long) row[1];
                return Map.entry(plan, count);
            })
            .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));

        List<UsersByPlanItemDTO> items = List.of(PlanType.values()).stream()
            .map(plan -> new UsersByPlanItemDTO(plan.name(), countByPlan.getOrDefault(plan, 0L)))
            .collect(Collectors.toList());

        return new UsersByPlanStatsDTO(items);
    }
}
