package com.tripflow.mappers;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.tripflow.dto.itinerary.collaborator.CollaboratorDTO;
import com.tripflow.model.itinerary.ItineraryCollaborator;

@Mapper(componentModel = "spring", uses = {UserMapper.class})
public interface CollaboratorMapper {
    @Mapping(source = "itinerary.id", target = "itineraryId")
    @Mapping(source = "itinerary.title", target = "itineraryTitle")
    @Mapping(source = "itinerary.user.username", target = "fromUser")
    CollaboratorDTO toDTO(ItineraryCollaborator collaborator);

    List<CollaboratorDTO> toDTOs(List<ItineraryCollaborator> collaborators);
}
