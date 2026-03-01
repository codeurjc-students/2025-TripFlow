package com.tripflow.service.itinerary;

import java.util.ArrayList;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.tripflow.dto.itinerary.ExtendedItineraryDTO;
import com.tripflow.dto.itinerary.ItineraryDTO;
import com.tripflow.dto.itinerary.ItineraryDayDTO;
import com.tripflow.dto.shared.PaginatedDTO;
import com.tripflow.kafka.messages.AIGenerationMessage;
import com.tripflow.mappers.ItineraryMapper;
import com.tripflow.model.ExternalImage;
import com.tripflow.model.User;
import com.tripflow.model.itinerary.Itinerary;
import com.tripflow.model.itinerary.ItineraryDay;
import com.tripflow.model.types.ItineraryStatus;
import com.tripflow.repository.itinerary.ItineraryRepository;
import com.tripflow.repository.itinerary.ItineraryCollaboratorRepository;
import com.tripflow.service.ExternalImageService;
import com.tripflow.service.UserService;
import com.tripflow.model.itinerary.ItineraryCollaborator;
import com.tripflow.model.types.CollaboratorRole;
import com.tripflow.model.types.InvitationStatus;

import jakarta.transaction.Transactional;

@Service
public class ItineraryService {
    private final ItineraryRepository itineraryRepository;
    private final UserService userService;
    private final ExternalImageService externalImageService;
    private final ItineraryDayService itineraryDayService;
    private final ItineraryMapper itineraryMapper;
    private final ItineraryPermissionService itineraryPermissionService;
    private final ItineraryCollaboratorRepository itineraryCollaboratorRepository;

    public ItineraryService(
        ItineraryRepository itineraryRepository,
        UserService userService,
        ExternalImageService externalImageService,
        ItineraryDayService itineraryDayService,
        ItineraryMapper itineraryMapper,
        ItineraryPermissionService itineraryPermissionService,
        ItineraryCollaboratorRepository itineraryCollaboratorRepository
    ) {
        this.itineraryRepository = itineraryRepository;
        this.userService = userService;
        this.externalImageService = externalImageService;
        this.itineraryDayService = itineraryDayService;
        this.itineraryMapper = itineraryMapper;
        this.itineraryPermissionService = itineraryPermissionService;
        this.itineraryCollaboratorRepository = itineraryCollaboratorRepository;
    }

    /**
     * Processes a generated itinerary from an AI generation message.
     *
     * @param message the AI generation message containing the itinerary
     * @return true if the itinerary was processed successfully, false otherwise
     */
    public boolean processGeneratedItinerary(AIGenerationMessage message) {
        if (message.itinerary() == null) {
            return false;
        }
        
        try {
            User user = this.userService.getUserByUsername(message.username());
            ExtendedItineraryDTO itineraryDTO = message.itinerary();
            this.createItinerary(user, itineraryDTO);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Creates a new itinerary from the provided ItineraryDTO.
     *
     * @param user the user who owns the itinerary
     * @param itineraryDTO the DTO containing itinerary data
     * 
     * @return the created ItineraryDTO
     */
    public ExtendedItineraryDTO createItinerary(User user, ExtendedItineraryDTO itineraryDTO) {
        Itinerary newItinerary = new Itinerary();
        
        // Assign basic details from the DTO to the entity
        this.assignExtraDetails(newItinerary, itineraryDTO);

        List<ItineraryDayDTO> days = itineraryDTO.days();

        // Iterate through days in the itinerary and create each day
        for (ItineraryDayDTO day : days) {
            ItineraryDay newDay = this.itineraryDayService.createItineraryDayEntity(day, newItinerary);
            newItinerary.addDay(newDay);
        }

        // Set the user for the itinerary
        user.addItinerary(newItinerary);
        newItinerary.setUser(user);

        ExternalImage coverImage = this.externalImageService.getOrCreateImageByQuery(itineraryDTO.place());
        newItinerary.setCoverImage(coverImage);

        Itinerary savedItinerary = this.itineraryRepository.save(newItinerary);

        // Add owner as a collaborator with OWNER role and ACCEPTED status
        ItineraryCollaborator ownerCollaborator = new ItineraryCollaborator(
            CollaboratorRole.OWNER,
            user,
            savedItinerary
        );
        ownerCollaborator.setStatus(InvitationStatus.ACCEPTED);

        this.itineraryCollaboratorRepository.save(ownerCollaborator);

        return this.itineraryMapper.toExtendedDTO(savedItinerary);
    }

    /**
     * Creates a new itinerary from the provided ItineraryDTO.
     *
     * @param itineraryDTO the DTO containing itinerary data
     * @return the created ItineraryDTO
     */
    public ExtendedItineraryDTO createItinerary(ExtendedItineraryDTO itineraryDTO) {
        User authenticatedUser = this.userService.getAuthenticatedUser();
        return this.createItinerary(authenticatedUser, itineraryDTO);
    }

    /**
     * Retrieves all itineraries for the authenticated user, paginated.
     *
     * @param pageable pagination information
     * @param search optional search query to filter itineraries
     * @return a PaginatedDTO containing a list of ItineraryDTOs
     */
    public PaginatedDTO<ItineraryDTO> getAllItineraries(Pageable pageable, String search) {
        User authenticatedUser = this.userService.getAuthenticatedUser();

        Page<Itinerary> itinerariesPage;

        if (search != null && !search.trim().isEmpty()) {
            itinerariesPage = this.itineraryRepository.findAllByUserOrCollaboratorAndSearchOrderByUpdatedAtDesc(
                authenticatedUser, search.trim(), pageable
            );
        } else {
            itinerariesPage = this.itineraryRepository.findAllByUserOrCollaboratorOrderByUpdatedAtDesc(
                authenticatedUser, pageable
            );
        }

        List<ItineraryDTO> itineraryDTOs = this.itineraryMapper.toDTOs(itinerariesPage.getContent());

        return new PaginatedDTO<ItineraryDTO>(
            itineraryDTOs,
            itinerariesPage.getNumber(),
            itinerariesPage.getTotalPages(),
            itinerariesPage.getTotalElements(),
            itinerariesPage.getSize(),
            itinerariesPage.isLast()
        );
    }

    /**
     * Retrieves an itinerary by its ID, ensuring the authenticated user has view permission.
     *
     * @param id the ID of the itinerary to retrieve
     * @return the ItineraryDTO for the specified ID
     * @throws ResponseStatusException NOT_FOUND | FORBIDDEN
     */
    public ExtendedItineraryDTO getItineraryById(Long id) throws ResponseStatusException {
        Itinerary itinerary = this.itineraryRepository.findById(id).orElseThrow(
            () -> new ResponseStatusException(HttpStatus.NOT_FOUND, String.format("Itinerary with ID %d not found", id))
        );

        // Ensure the authenticated user has permission to view the itinerary
        User authenticatedUser = this.userService.getAuthenticatedUser();
        if (!this.itineraryPermissionService.canView(itinerary, authenticatedUser)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have permission to access this itinerary");
        }

        return this.itineraryMapper.toExtendedDTO(itinerary);
    }

    /**
     * Updates an existing itinerary with the provided ItineraryDTO.
     *
     * @param id the ID of the itinerary to update
     * @param itineraryDTO the DTO containing updated itinerary data
     * @return the updated ItineraryDTO
     * @throws ResponseStatusException NOT_FOUND | FORBIDDEN
     */
    @Transactional
    public ExtendedItineraryDTO updateItinerary(Long id, ExtendedItineraryDTO itineraryDTO) throws ResponseStatusException {
        Itinerary itinerary = this.itineraryRepository.findById(id).orElseThrow(
            () -> new ResponseStatusException(HttpStatus.NOT_FOUND, String.format("Itinerary with ID %d not found", id))
        );

        // Ensure the authenticated user has permission to update the itinerary
        User authenticatedUser = this.userService.getAuthenticatedUser();
        if (!this.itineraryPermissionService.canEdit(itinerary, authenticatedUser)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have permission to update this itinerary");
        }

        // Update basic details
        this.assignExtraDetails(itinerary, itineraryDTO);

        // Clear existing days
        this.itineraryDayService.deleteAllDaysByItinerary(itinerary);

        // Iterate through the new days in the itinerary and create each day
        List<ItineraryDay> days = new ArrayList<>();
        for (ItineraryDayDTO dayDTO : itineraryDTO.days()) {
            ItineraryDay newDay = this.itineraryDayService.createItineraryDayEntity(dayDTO, itinerary);
            days.add(newDay);
        }
        itinerary.setDays(days);

        // Increment the updated count
        itinerary.setUpdatedCount(itinerary.getUpdatedCount() + 1);

        // Save and return the updated DTO
        return this.itineraryMapper.toExtendedDTO(this.itineraryRepository.save(itinerary));
    }

    /**
     * Deletes an itinerary by its ID, ensuring the authenticated user is the owner.
     *
     * @param id the ID of the itinerary to delete
     * @throws ResponseStatusException NOT_FOUND | FORBIDDEN
     */
    public void deleteItinerary(Long id) throws ResponseStatusException {
        Itinerary itinerary = this.itineraryRepository.findById(id).orElseThrow(
            () -> new ResponseStatusException(HttpStatus.NOT_FOUND, String.format("Itinerary with ID %d not found", id))
        );

        // Ensure the authenticated user is the owner of the itinerary
        User authenticatedUser = this.userService.getAuthenticatedUser();
        if (!this.itineraryPermissionService.canDelete(itinerary, authenticatedUser)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have permission to delete this itinerary");
        }

        authenticatedUser.removeItinerary(itinerary);

        this.itineraryRepository.delete(itinerary);
    }


    /**
     * Sums the total number of days across all itineraries for a given user.
     *
     * @param userId the ID of the user
     * @return the total number of days
     */
    public Long countTotalDaysByUserId(Long userId) {
        return this.itineraryRepository.countTotalDaysByUserId(userId);
    }

    /**
     * Counts the number of distinct locations across all itineraries for a given user.
     *
     * @param userId the ID of the user
     * @return the count of distinct locations
     */
    public Long countDistinctLocationsByUserId(Long userId) {
        return this.itineraryRepository.countDistinctLocationsByUserId(userId);
    }

    /**
     * Assigns extra details from the DTO to the Itinerary entity.
     * 
     * @param itinerary the Itinerary entity to update
     * @param itineraryDTO the DTO containing updated details
     */
    private void assignExtraDetails(Itinerary itinerary, ExtendedItineraryDTO itineraryDTO) {
        if (!itineraryDTO.place().equals(itinerary.getPlace())) {
            ExternalImage coverImage = this.externalImageService.getOrCreateImageByQuery(itineraryDTO.place());
            itinerary.setCoverImage(coverImage);
        }

        itinerary.setTitle(itineraryDTO.title());
        itinerary.setPlace(itineraryDTO.place());
        itinerary.setPeople(itineraryDTO.people());
        itinerary.setBudget(itineraryDTO.budget());
        itinerary.setDate(itineraryDTO.date());
        itinerary.setTags(itineraryDTO.tags());
        itinerary.setStatus(
            itineraryDTO.status() != null
                ? ItineraryStatus.valueOf(itineraryDTO.status().name())
                : ItineraryStatus.DRAFT
        );
    }
}
