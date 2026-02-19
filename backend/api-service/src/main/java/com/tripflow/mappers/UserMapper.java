package com.tripflow.mappers;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.tripflow.dto.user.PublicUserDTO;
import com.tripflow.dto.user.RegisterUserRequest;
import com.tripflow.model.User;
import com.tripflow.model.types.UserType;

@Mapper(componentModel = "spring")
public interface UserMapper {
    PublicUserDTO toPublicUserDTO(User user);
    List<PublicUserDTO> toPublicUserDTOs(List<User> users);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "username", source = "request.username")
    @Mapping(target = "hashedPassword", source = "hashedPassword")
    @Mapping(target = "role", source = "role")
    @Mapping(target = "name", expression = "java(request.username())")
    @Mapping(target = "avatar", ignore = true)
    @Mapping(target = "description", ignore = true)
    @Mapping(target = "location", ignore = true)
    @Mapping(target = "notificationsAllowed", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "plan", ignore = true)
    @Mapping(target = "itineraries", ignore = true)
    @Mapping(target = "verified", ignore = true)
    @Mapping(target = "verificationCode", ignore = true)
    @Mapping(target = "verificationCodeExpiresAt", ignore = true)
    @Mapping(target = "processingAI", ignore = true)
    @Mapping(target = "aiUsages", ignore = true)
    @Mapping(target = "collaborations", ignore = true)
    User toDomain(RegisterUserRequest request, String hashedPassword, UserType role);
}