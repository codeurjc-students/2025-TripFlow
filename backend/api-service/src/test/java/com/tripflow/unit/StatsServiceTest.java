package com.tripflow.unit;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import com.tripflow.dto.stats.StatDTO;
import com.tripflow.dto.stats.UserStatsDTO;
import com.tripflow.dto.stats.UsersByPlanStatsDTO;
import com.tripflow.model.User;
import com.tripflow.model.types.PlanType;
import com.tripflow.model.types.UserType;
import com.tripflow.repository.UserRepository;
import com.tripflow.service.StatsService;
import com.tripflow.service.UserService;
import com.tripflow.service.itinerary.ActivityService;
import com.tripflow.service.itinerary.ItineraryService;

@Tag("unit")
public class StatsServiceTest {
    private UserService userService;
    private UserRepository userRepository;
    private ItineraryService itineraryService;
    private ActivityService activityService;
    private StatsService statsService;

    @BeforeEach
    public void setUp() {
        this.userService = mock(UserService.class);
        this.userRepository = mock(UserRepository.class);
        this.itineraryService = mock(ItineraryService.class);
        this.activityService = mock(ActivityService.class);

        this.statsService = new StatsService(
            userService, userRepository, itineraryService, activityService
        );
    }

    @Test
    @DisplayName("StatsService should return user statistics")
    public void testGetUserStats() {
        User user = new User();
        user.setId(1L);

        when(userService.getAuthenticatedUser()).thenReturn(user);
        when(activityService.countActivitiesByUserId(1L)).thenReturn(15L);
        when(itineraryService.countDistinctLocationsByUserId(1L)).thenReturn(8L);
        when(itineraryService.countTotalDaysByUserId(1L)).thenReturn(45L);

        UserStatsDTO result = statsService.getUserStats();

        assertNotNull(result);
        assertEquals(3, result.stats().size());

        List<StatDTO> stats = result.stats();
        assertEquals("activities", stats.get(0).key());
        assertEquals(15L, stats.get(0).value());
        assertEquals("places_visited", stats.get(1).key());
        assertEquals(8L, stats.get(1).value());
        assertEquals("total_days", stats.get(2).key());
        assertEquals(45L, stats.get(2).value());

        verify(activityService).countActivitiesByUserId(1L);
        verify(itineraryService).countDistinctLocationsByUserId(1L);
        verify(itineraryService).countTotalDaysByUserId(1L);
    }

    @Test
    @DisplayName("StatsService should return zero statistics for new user")
    public void testGetUserStatsForNewUser() {
        User user = new User();
        user.setId(2L);

        when(userService.getAuthenticatedUser()).thenReturn(user);
        when(activityService.countActivitiesByUserId(2L)).thenReturn(0L);
        when(itineraryService.countDistinctLocationsByUserId(2L)).thenReturn(0L);
        when(itineraryService.countTotalDaysByUserId(2L)).thenReturn(0L);

        UserStatsDTO result = statsService.getUserStats();

        assertNotNull(result);
        assertEquals(3, result.stats().size());

        List<StatDTO> stats = result.stats();
        assertEquals(0L, stats.get(0).value());
        assertEquals(0L, stats.get(1).value());
        assertEquals(0L, stats.get(2).value());
    }

    @Test
    @DisplayName("StatsService should throw UNAUTHORIZED when user is not authenticated")
    public void testGetUserStatsNotAuthenticated() {
        when(userService.getAuthenticatedUser()).thenReturn(null);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
            statsService.getUserStats()
        );
        assertEquals(HttpStatus.UNAUTHORIZED, ex.getStatusCode());
        assertEquals("User not authenticated", ex.getReason());

        verify(activityService, never()).countActivitiesByUserId(any());
        verify(itineraryService, never()).countDistinctLocationsByUserId(any());
        verify(itineraryService, never()).countTotalDaysByUserId(any());
    }

    @Test
    @DisplayName("StatsService should handle large statistics values")
    public void testGetUserStatsWithLargeValues() {
        User user = new User();
        user.setId(1L);

        when(userService.getAuthenticatedUser()).thenReturn(user);
        when(activityService.countActivitiesByUserId(1L)).thenReturn(1000L);
        when(itineraryService.countDistinctLocationsByUserId(1L)).thenReturn(500L);
        when(itineraryService.countTotalDaysByUserId(1L)).thenReturn(10000L);

        UserStatsDTO result = statsService.getUserStats();

        assertNotNull(result);
        List<StatDTO> stats = result.stats();
        assertEquals(1000L, stats.get(0).value());
        assertEquals(500L, stats.get(1).value());
        assertEquals(10000L, stats.get(2).value());
    }

    @Test
    @DisplayName("StatsService should return users grouped by plan for admin")
    public void testGetUsersByPlanStatsAsAdmin() {
        User admin = new User();
        admin.setRole(UserType.ADMIN);

        when(userService.getAuthenticatedUser()).thenReturn(admin);
        when(userRepository.countUsersByPlan()).thenReturn(List.of(
            new Object[] { PlanType.FREE, 5L },
            new Object[] { PlanType.PRO, 3L },
            new Object[] { PlanType.PREMIUM, 1L }
        ));

        UsersByPlanStatsDTO result = statsService.getUsersByPlanStats();

        assertNotNull(result);
        assertEquals(3, result.items().size());
        assertEquals("FREE", result.items().get(0).plan());
        assertEquals(5L, result.items().get(0).count());
    }

    @Test
    @DisplayName("StatsService should throw FORBIDDEN for non-admin user by plan stats")
    public void testGetUsersByPlanStatsAsNonAdmin() {
        User user = new User();
        user.setRole(UserType.USER);

        when(userService.getAuthenticatedUser()).thenReturn(user);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
            statsService.getUsersByPlanStats()
        );

        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
        assertEquals("Admin role required", ex.getReason());
        verify(userRepository, never()).countUsersByPlan();
    }
}
