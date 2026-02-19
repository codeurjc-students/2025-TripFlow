package com.tripflow.unit;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

import java.util.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.*;

import com.tripflow.dto.itinerary.ExtendedItineraryDTO;
import com.tripflow.dto.itinerary.ItineraryDTO;
import com.tripflow.dto.itinerary.ItineraryDayDTO;
import com.tripflow.dto.shared.PaginatedDTO;
import com.tripflow.mappers.ItineraryMapper;
import com.tripflow.model.User;
import com.tripflow.model.itinerary.Itinerary;
import com.tripflow.model.itinerary.ItineraryDay;
import com.tripflow.repository.itinerary.ItineraryRepository;
import com.tripflow.repository.itinerary.ItineraryCollaboratorRepository;
import com.tripflow.service.ExternalImageService;
import com.tripflow.service.UserService;
import com.tripflow.service.itinerary.ItineraryDayService;
import com.tripflow.service.itinerary.ItineraryService;
import com.tripflow.service.itinerary.ItineraryPermissionService;

import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

@Tag("unit")
public class ItineraryServiceTest {
    private ItineraryRepository itineraryRepository;
    private UserService userService;
    private ExternalImageService externalImageService;
    private ItineraryDayService itineraryDayService;
    private ItineraryMapper itineraryMapper;
    private ItineraryPermissionService itineraryPermissionService;
    private ItineraryCollaboratorRepository itineraryCollaboratorRepository;
    private ItineraryService itineraryService;

    @BeforeEach
    public void setUp() {
        this.itineraryRepository = mock(ItineraryRepository.class);
        this.userService = mock(UserService.class);
        this.externalImageService = mock(ExternalImageService.class);
        this.itineraryDayService = mock(ItineraryDayService.class);
        this.itineraryMapper = mock(ItineraryMapper.class);
        this.itineraryPermissionService = mock(ItineraryPermissionService.class);

        this.itineraryCollaboratorRepository = mock(ItineraryCollaboratorRepository.class);

        this.itineraryService = new ItineraryService(
            itineraryRepository, userService, externalImageService,
            itineraryDayService, itineraryMapper, itineraryPermissionService,
            itineraryCollaboratorRepository
        );
    }

    @Test
    @DisplayName("ItineraryService should create a new itinerary")
    public void testCreateItinerary() {
        User user = mock(User.class);

        ExtendedItineraryDTO dto = mock(ExtendedItineraryDTO.class);
        List<ItineraryDayDTO> dayDTOs = List.of(mock(ItineraryDayDTO.class));
        when(dto.place()).thenReturn("Paris");
        when(dto.days()).thenReturn(dayDTOs);
        when(externalImageService.getOrCreateImageByQuery(eq("Paris"))).thenReturn(null);

        ItineraryDay dayEntity = mock(ItineraryDay.class);
        when(itineraryDayService.createItineraryDayEntity(any(), any())).thenReturn(dayEntity);

        doNothing().when(user).addItinerary(any(Itinerary.class));
        when(userService.getAuthenticatedUser()).thenReturn(user);

        Itinerary savedItinerary = mock(Itinerary.class);
        when(itineraryRepository.save(any(Itinerary.class))).thenReturn(savedItinerary);

        ExtendedItineraryDTO expectedDTO = mock(ExtendedItineraryDTO.class);
        when(itineraryMapper.toExtendedDTO(savedItinerary)).thenReturn(expectedDTO);

        ExtendedItineraryDTO result = itineraryService.createItinerary(dto);

        assertEquals(expectedDTO, result);
        verify(itineraryRepository).save(any(Itinerary.class));
        verify(itineraryDayService).createItineraryDayEntity(any(), any());
        verify(user).addItinerary(any(Itinerary.class));
        verify(itineraryCollaboratorRepository).save(any());
    }

    @Test
    @DisplayName("ItineraryService should return paginated itineraries")
    public void testGetAllItineraries() {
        User user = new User();
        user.setId(1L);
        Pageable pageable = PageRequest.of(0, 2);

        Itinerary itinerary = mock(Itinerary.class);
        List<Itinerary> itineraryList = List.of(itinerary);
        Page<Itinerary> itineraryPage = new PageImpl<>(itineraryList, pageable, 1);

        when(userService.getAuthenticatedUser()).thenReturn(user);
        when(itineraryRepository.findAllByUserOrCollaboratorOrderByUpdatedAtDesc(
            user, pageable
        )).thenReturn(itineraryPage);

        ItineraryDTO itineraryDTO = mock(ItineraryDTO.class);
        when(itineraryMapper.toDTOs(itineraryList)).thenReturn(List.of(itineraryDTO));

        PaginatedDTO<ItineraryDTO> result = itineraryService.getAllItineraries(pageable, null);

        assertEquals(1, result.page().size());
        assertEquals(0, result.currentPage());
        assertEquals(1, result.totalPages());
        assertEquals(1, result.totalItems());
        assertEquals(2, result.itemsPerPage());
        assertTrue(result.isLastPage());
    }

    @Test
    @DisplayName("ItineraryService should update itinerary if user is owner")
    public void testUpdateItinerarySuccess() {
        Long itineraryId = 1L;
        User user = new User();
        user.setId(1L);

        Itinerary itinerary = new Itinerary();
        itinerary.setUser(user);
        itinerary.setId(itineraryId);

        ExtendedItineraryDTO dto = mock(ExtendedItineraryDTO.class);
        List<ItineraryDayDTO> dayDTOs = List.of(mock(ItineraryDayDTO.class));
        when(dto.place()).thenReturn("Rome");
        when(dto.days()).thenReturn(dayDTOs);

        when(itineraryRepository.findById(itineraryId)).thenReturn(Optional.of(itinerary));
        when(userService.getAuthenticatedUser()).thenReturn(user);
        when(itineraryPermissionService.canEdit(itinerary, user)).thenReturn(true);

        doNothing().when(itineraryDayService).deleteAllDaysByItinerary(itinerary);
        ItineraryDay dayEntity = mock(ItineraryDay.class);
        when(itineraryDayService.createItineraryDayEntity(any(), eq(itinerary))).thenReturn(dayEntity);

        Itinerary updatedItinerary = mock(Itinerary.class);
        when(itineraryRepository.save(itinerary)).thenReturn(updatedItinerary);

        ExtendedItineraryDTO expectedDTO = mock(ExtendedItineraryDTO.class);
        when(itineraryMapper.toExtendedDTO(updatedItinerary)).thenReturn(expectedDTO);

        ExtendedItineraryDTO result = itineraryService.updateItinerary(itineraryId, dto);

        assertEquals(expectedDTO, result);
        verify(itineraryDayService).deleteAllDaysByItinerary(itinerary);
        verify(itineraryDayService).createItineraryDayEntity(any(), eq(itinerary));
        verify(itineraryRepository).save(itinerary);
    }

    @Test
    @DisplayName("ItineraryService should throw NOT_FOUND if itinerary does not exist on update")
    public void testUpdateItineraryNotFound() {
        when(itineraryRepository.findById(1L)).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
            itineraryService.updateItinerary(1L, mock(ExtendedItineraryDTO.class))
        );
        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    }

    @Test
    @DisplayName("ItineraryService should throw FORBIDDEN if user is not owner on update")
    public void testUpdateItineraryForbidden() {
        User owner = new User();
        owner.setId(1L);
        User otherUser = new User();
        otherUser.setId(2L);

        Itinerary itinerary = new Itinerary();
        itinerary.setUser(owner);

        when(itineraryRepository.findById(1L)).thenReturn(Optional.of(itinerary));
        when(userService.getAuthenticatedUser()).thenReturn(otherUser);
        when(itineraryPermissionService.canEdit(itinerary, otherUser)).thenReturn(false);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
            itineraryService.updateItinerary(1L, mock(ExtendedItineraryDTO.class))
        );
        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
    }

    @Test
    @DisplayName("ItineraryService should get itinerary by id if user is owner")
    public void testGetItineraryByIdSuccess() {
        User user = new User();
        user.setId(1L);

        Itinerary itinerary = new Itinerary();
        itinerary.setUser(user);

        when(itineraryRepository.findById(1L)).thenReturn(Optional.of(itinerary));
        when(userService.getAuthenticatedUser()).thenReturn(user);
        when(itineraryPermissionService.canView(itinerary, user)).thenReturn(true);

        ExtendedItineraryDTO expectedDTO = mock(ExtendedItineraryDTO.class);
        when(itineraryMapper.toExtendedDTO(itinerary)).thenReturn(expectedDTO);

        ExtendedItineraryDTO result = itineraryService.getItineraryById(1L);

        assertEquals(expectedDTO, result);
    }

    @Test
    @DisplayName("ItineraryService should throw NOT_FOUND if itinerary does not exist on get by id")
    public void testGetItineraryByIdNotFound() {
        when(itineraryRepository.findById(1L)).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
            itineraryService.getItineraryById(1L)
        );
        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    }

    @Test
    @DisplayName("ItineraryService should throw FORBIDDEN if user is not owner on get by id")
    public void testGetItineraryByIdForbidden() {
        User owner = new User();
        owner.setId(1L);
        User otherUser = new User();
        otherUser.setId(2L);

        Itinerary itinerary = new Itinerary();
        itinerary.setUser(owner);

        when(itineraryRepository.findById(1L)).thenReturn(Optional.of(itinerary));
        when(userService.getAuthenticatedUser()).thenReturn(otherUser);
        when(itineraryPermissionService.canView(itinerary, otherUser)).thenReturn(false);

        ResponseStatusException ex = assertThrows(
            ResponseStatusException.class, () -> itineraryService.getItineraryById(1L),
            "Itinerary with ID 1 not found"
        );

        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
    }

    @Test
    @DisplayName("ItineraryService should delete itinerary if user is owner")
    public void testDeleteItinerarySuccess() {
        User user = new User();
        user.setId(1L);

        Itinerary itinerary = new Itinerary();
        itinerary.setUser(user);

        when(itineraryRepository.findById(1L)).thenReturn(Optional.of(itinerary));
        when(userService.getAuthenticatedUser()).thenReturn(user);
        when(itineraryPermissionService.canDelete(itinerary, user)).thenReturn(true);

        itineraryService.deleteItinerary(1L);

        verify(itineraryRepository).delete(itinerary);
    }

    @Test
    @DisplayName("ItineraryService should throw NOT_FOUND if itinerary does not exist on delete")
    public void testDeleteItineraryNotFound() {
        when(itineraryRepository.findById(1L)).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
            itineraryService.deleteItinerary(1L)
        );
        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    }

    @Test
    @DisplayName("ItineraryService should throw FORBIDDEN if user is not owner on delete")
    public void testDeleteItineraryForbidden() {
        User owner = new User();
        owner.setId(1L);
        User otherUser = new User();
        otherUser.setId(2L);

        Itinerary itinerary = new Itinerary();
        itinerary.setUser(owner);

        when(itineraryRepository.findById(1L)).thenReturn(Optional.of(itinerary));
        when(userService.getAuthenticatedUser()).thenReturn(otherUser);
        when(itineraryPermissionService.canDelete(itinerary, otherUser)).thenReturn(false);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
            itineraryService.deleteItinerary(1L)
        );
        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
    }
}