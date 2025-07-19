package com.tripflow.service;

import java.util.NoSuchElementException;

import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.tripflow.dto.user.PublicUserDTO;
import com.tripflow.dto.user.RegisterUserRequest;
import com.tripflow.dto.user.UserMapper;
import com.tripflow.model.User;
import com.tripflow.model.types.UserType;
import com.tripflow.repository.UserRepository;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    public UserService(
        UserRepository userRepository, UserMapper userMapper,
        PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.userMapper = userMapper;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Retrieves a public user DTO by username.
     *
     * @param username the username of the user to retrieve
     * @return a PublicUserDTO containing the user's public information
     * @throws NoSuchElementException
     */
    public PublicUserDTO getPublicUserByUsername(String username) {
        User user = this.userRepository.findByUsername(username).
            orElseThrow(() -> new UsernameNotFoundException("User not found"));
        return userMapper.toPublicUserDTO(user);
    }

    /**
     * Registers a new user into the system.
     * 
     * @param request the user registration request containing user details
     * @return a PublicUserDTO containing the registered user's public information
     */
    public PublicUserDTO registerUser(RegisterUserRequest request) throws IllegalArgumentException {
        // Check if the user already exists
        if (this.userRepository.existsByUsername(request.username())) {
            throw new IllegalArgumentException("User already exists with username");
        }

        // Create a new user entity from the request
        String hashedPassword = this.passwordEncoder.encode(request.password());
        User user = this.userMapper.toDomain(request, hashedPassword, UserType.USER);

        return this.userMapper.toPublicUserDTO(this.userRepository.save(user));
    }
}