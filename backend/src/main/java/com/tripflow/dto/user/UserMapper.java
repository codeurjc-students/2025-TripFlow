package com.tripflow.dto.user;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.tripflow.model.User;
import com.tripflow.model.types.UserType;

@Mapper(componentModel = "spring")
public interface UserMapper {
    PublicUserDTO toPublicUserDTO(User user);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "username", source = "request.username")
    @Mapping(target = "hashedPassword", source = "hashedPassword")
    @Mapping(target = "role", source = "role")
    @Mapping(target = "name", expression = "java(request.username())")
    @Mapping(target = "avatar", ignore = true)
    @Mapping(target = "description", ignore = true)
    @Mapping(target = "location", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    User toDomain(RegisterUserRequest request, String hashedPassword, UserType role);
}