package com.tripflow.service.itinerary;

import java.util.ArrayList;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.tripflow.dto.itinerary.ExtendedItineraryDTO;
import com.tripflow.dto.itinerary.ExtendedItineraryResponseDTO;
import com.tripflow.dto.itinerary.ItineraryDTO;
import com.tripflow.dto.itinerary.ItineraryResponseDTO;
import com.tripflow.dto.itinerary.ItineraryDayDTO;
import com.tripflow.dto.itinerary.PermissionsDTO;
import com.tripflow.dto.shared.PaginatedDTO;
import com.tripflow.kafka.messages.AIGenerationMessage;
import com.tripflow.kafka.messages.ItineraryChangeMessage;
import com.tripflow.kafka.messages.ItineraryChangeType;
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
import com.tripflow.service.KafkaService;
import com.tripflow.util.ItinerarySanitizer;

import jakarta.transaction.Transactional;

@Service
public class ItineraryService {
    private static final Logger log = LoggerFactory.getLogger(ItineraryService.class);

    private final ItineraryRepository itineraryRepository;
    private final UserService userService;
    private final ExternalImageService externalImageService;
    private final ItineraryDayService itineraryDayService;
    private final ItineraryMapper itineraryMapper;
    private final ItineraryPermissionService itineraryPermissionService;
    private final ItineraryCollaboratorRepository itineraryCollaboratorRepository;
    private final KafkaService kafkaService;

    public ItineraryService(
        ItineraryRepository itineraryRepository,
        UserService userService,
        ExternalImageService externalImageService,
        ItineraryDayService itineraryDayService,
        ItineraryMapper itineraryMapper,
        ItineraryPermissionService itineraryPermissionService,
        ItineraryCollaboratorRepository itineraryCollaboratorRepository,
        KafkaService kafkaService
    ) {
        this.itineraryRepository = itineraryRepository;
        this.userService = userService;
        this.externalImageService = externalImageService;
        this.itineraryDayService = itineraryDayService;
        this.itineraryMapper = itineraryMapper;
        this.itineraryPermissionService = itineraryPermissionService;
        this.itineraryCollaboratorRepository = itineraryCollaboratorRepository;
        this.kafkaService = kafkaService;
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
        } catch (RuntimeException ex) {
            log.error("Failed to process generated itinerary for user {}", message.username(), ex);
            return false;
        }
    }

    /**
     * Creates a new itinerary from the provided ItineraryDTO.
     *
     * @param user the user who owns the itinerary
     * @param itineraryDTO the DTO containing itinerary data
     * 
     * @return the created ExtendedItineraryResponseDTO
     */
    public ExtendedItineraryResponseDTO createItinerary(User user, ExtendedItineraryDTO itineraryDTO) {
        ExtendedItineraryDTO sanitizedItinerary = ItinerarySanitizer.sanitizeExtendedItinerary(itineraryDTO);
        Itinerary newItinerary = new Itinerary();
        
        // Assign basic details from the DTO to the entity
        this.assignExtraDetails(newItinerary, sanitizedItinerary);

        List<ItineraryDayDTO> days = sanitizedItinerary.days();

        // Iterate through days in the itinerary and create each day
        for (ItineraryDayDTO day : days) {
            ItineraryDay newDay = this.itineraryDayService.createItineraryDayEntity(day, newItinerary);
            newItinerary.addDay(newDay);
        }

        // Set the user for the itinerary
        user.addItinerary(newItinerary);
        newItinerary.setUser(user);

        ExternalImage coverImage = this.externalImageService.getOrCreateImageByQuery(sanitizedItinerary.place());
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

        ExtendedItineraryDTO dto = this.itineraryMapper.toExtendedDTO(savedItinerary);
        PermissionsDTO permissions = new PermissionsDTO(true, true, true);
        return new ExtendedItineraryResponseDTO(dto, permissions);
    }

    /**
     * Creates a new itinerary from the provided ItineraryDTO.
     *
     * @param itineraryDTO the DTO containing itinerary data
     * @return the created ExtendedItineraryResponseDTO
     */
    public ExtendedItineraryResponseDTO createItinerary(ExtendedItineraryDTO itineraryDTO) {
        User authenticatedUser = this.userService.getAuthenticatedUser();
        return this.createItinerary(authenticatedUser, itineraryDTO);
    }

    /**
     * Retrieves all itineraries for the authenticated user, paginated.
     *
     * @param pageable pagination information
     * @param search optional search query to filter itineraries
     * @return a PaginatedDTO containing a list of ItineraryResponseDTOs
     */
    public PaginatedDTO<ItineraryResponseDTO> getAllItineraries(Pageable pageable, String search) {
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

        List<Itinerary> itineraries = itinerariesPage.getContent();
        List<ItineraryDTO> itineraryDTOs = this.itineraryMapper.toDTOs(itineraries);

        List<ItineraryResponseDTO> responseDTOs = new ArrayList<>();
        for (int i = 0; i < itineraries.size(); i++) {
            Itinerary itinerary = itineraries.get(i);
            PermissionsDTO permissions = this.createPermissionsDTO(itinerary, authenticatedUser);
            responseDTOs.add(new ItineraryResponseDTO(itineraryDTOs.get(i), permissions));
        }

        return new PaginatedDTO<ItineraryResponseDTO>(
            responseDTOs,
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
     * @throws ResponseStatusException NOT_FOUND | FORBIDDEN
     * @return the ExtendedItineraryResponseDTO for the specified ID
     */
    public ExtendedItineraryResponseDTO getItineraryById(Long id) throws ResponseStatusException {
        Itinerary itinerary = this.itineraryRepository.findById(id).orElseThrow(
            () -> new ResponseStatusException(HttpStatus.NOT_FOUND, String.format("Itinerary with ID %d not found", id))
        );

        // Ensure the authenticated user has permission to view the itinerary
        User authenticatedUser = this.userService.getAuthenticatedUser();
        if (!this.itineraryPermissionService.canView(itinerary, authenticatedUser)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have permission to access this itinerary");
        }

        PermissionsDTO permissions = this.createPermissionsDTO(itinerary, authenticatedUser);
        ExtendedItineraryDTO dto = this.itineraryMapper.toExtendedDTO(itinerary);

        return new ExtendedItineraryResponseDTO(dto, permissions);
    }

    /**
     * Updates an existing itinerary with the provided ItineraryDTO.
     *
     * @param id the ID of the itinerary to update
     * @param itineraryDTO the DTO containing updated itinerary data
     * @throws ResponseStatusException NOT_FOUND | FORBIDDEN
     * @return the updated ExtendedItineraryResponseDTO
     */
    @Transactional
    public ExtendedItineraryResponseDTO updateItinerary(Long id, ExtendedItineraryDTO itineraryDTO) throws ResponseStatusException {
        ExtendedItineraryDTO sanitizedItinerary = ItinerarySanitizer.sanitizeExtendedItinerary(itineraryDTO);
        Itinerary itinerary = this.itineraryRepository.findById(id).orElseThrow(
            () -> new ResponseStatusException(HttpStatus.NOT_FOUND, String.format("Itinerary with ID %d not found", id))
        );

        // Ensure the authenticated user has permission to update the itinerary
        User authenticatedUser = this.userService.getAuthenticatedUser();
        if (!this.itineraryPermissionService.canEdit(itinerary, authenticatedUser)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have permission to update this itinerary");
        }

        // Update basic details
        this.assignExtraDetails(itinerary, sanitizedItinerary);

        // Clear existing days
        this.itineraryDayService.deleteAllDaysByItinerary(itinerary);

        // Iterate through the new days in the itinerary and create each day
        List<ItineraryDay> days = new ArrayList<>();
        for (ItineraryDayDTO dayDTO : sanitizedItinerary.days()) {
            ItineraryDay newDay = this.itineraryDayService.createItineraryDayEntity(dayDTO, itinerary);
            days.add(newDay);
        }
        itinerary.setDays(days);

        // Increment the updated count
        itinerary.setUpdatedCount(itinerary.getUpdatedCount() + 1);

        // Save and return the updated DTO
        ExtendedItineraryDTO dto = this.itineraryMapper.toExtendedDTO(this.itineraryRepository.save(itinerary));

        this.kafkaService.sendItineraryChangeMessage(new ItineraryChangeMessage(
            itinerary.getId(),
            ItineraryChangeType.UPDATED,
            authenticatedUser.getUsername()
        ));
        
        PermissionsDTO permissions = new PermissionsDTO(
            true, true, this.itineraryPermissionService.canDelete(itinerary, authenticatedUser)
        );

        return new ExtendedItineraryResponseDTO(dto, permissions);
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

    private PermissionsDTO createPermissionsDTO(Itinerary itinerary, User user) {
        return new PermissionsDTO(
            this.itineraryPermissionService.canView(itinerary, user),
            this.itineraryPermissionService.canEdit(itinerary, user),
            this.itineraryPermissionService.canDelete(itinerary, user)
        );
    }
}
