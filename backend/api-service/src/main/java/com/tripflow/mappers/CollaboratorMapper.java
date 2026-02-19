package com.tripflow.mappers;

import java.util.List;

import org.mapstruct.Mapper;

import com.tripflow.dto.itinerary.collaborator.CollaboratorDTO;
import com.tripflow.model.itinerary.ItineraryCollaborator;

@Mapper(componentModel = "spring", uses = {UserMapper.class})
public interface CollaboratorMapper {
    CollaboratorDTO toDTO(ItineraryCollaborator collaborator);
    List<CollaboratorDTO> toDTOs(List<ItineraryCollaborator> collaborators);
}
