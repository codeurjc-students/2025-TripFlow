package com.tripflow.service;

import java.sql.SQLException;
import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.tripflow.dto.shared.PaginatedDTO;
import com.tripflow.exception.EmailAlreadyExistsException;
import com.tripflow.exception.UsernameAlreadyExistsException;
import com.tripflow.mappers.UserMapper;
import com.tripflow.dto.user.PublicUserDTO;
import com.tripflow.dto.user.RegisterUserRequest;
import com.tripflow.dto.user.UpdateUserRequest;
import com.tripflow.dto.user.VerificationCode;
import com.tripflow.model.User;
import com.tripflow.model.types.UserType;
import com.tripflow.repository.UserRepository;
import com.tripflow.utils.ImageUtils;
import com.tripflow.utils.VerificationUtils;

import java.time.Instant;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    @Value("${spring.profiles.active}")
    private String activeProfile;

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
    public PublicUserDTO getPublicUserByUsername(String username) throws UsernameNotFoundException {
        User user = this.userRepository.findByUsername(username).orElseThrow(
            () -> new UsernameNotFoundException("User not found")
        );
        return userMapper.toPublicUserDTO(user);
    }

    /**
     * Retrieves a user entity by username.
     *
     * @param username the username of the user to retrieve
     * @return the User entity
     * @throws NoSuchElementException
     */
    public User getUserByUsername(String username) throws UsernameNotFoundException {
        return this.userRepository.findByUsername(username).
            orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    /**
     * Retrieves a user entity by email.
     *
     * @param email the email of the user to retrieve
     * @return the User entity
     * @throws UsernameNotFoundException
     */
    public User getUserByEmail(String email) throws UsernameNotFoundException {
        return this.userRepository.findByEmail(email)
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    /**
     * Retrieves a paginated list of public user DTOs.
     *
     * @param pageable the pagination information
     * @param search the search query
     * 
     * @return a PaginatedDTO containing the list of PublicUserDTOs
     */
    public PaginatedDTO<PublicUserDTO> getAllUsers(Pageable pageable, String search) {
        String searchTerm = (search != null && !search.trim().isEmpty()) 
            ? "%" + search.trim().toLowerCase() + "%" 
            : null;

        Page<User> usersPage = this.userRepository.findAllByRoleAndUsernameContaining(
            UserType.USER, searchTerm, pageable
        );
        List<PublicUserDTO> userDTOs = this.userMapper.toPublicUserDTOs(usersPage.getContent());

        return new PaginatedDTO<PublicUserDTO>(
            userDTOs,
            usersPage.getNumber(),
            usersPage.getTotalPages(),
            usersPage.getTotalElements(),
            usersPage.getSize(),
            usersPage.isLast()
        );
    }

    /**
     * Registers a new regular user into the system.
     * 
     * @param request the user registration request containing user details
     * 
     * @return a PublicUserDTO containing the registered user's public information
     */
    public PublicUserDTO registerUser(RegisterUserRequest request) throws IllegalArgumentException {
        return this.registerUser(request, UserType.USER);
    }

    /**
     * Registers a new user into the system.
     * 
     * @param request the user registration request containing user details
     * @param userType the type of user to register (e.g., USER, ADMIN)
     * 
     * @return a PublicUserDTO containing the registered user's public information
     */
    public PublicUserDTO registerUser(RegisterUserRequest request, UserType userType) {
        // Check if the email already exists
        if (this.userRepository.existsByEmail(request.email())) {
            throw new EmailAlreadyExistsException("User already exists with email");
        }

        // Check if the user already exists
        if (this.userRepository.existsByUsername(request.username())) {
            throw new UsernameAlreadyExistsException("User already exists with username");
        }

        // Create a new user entity from the request
        String hashedPassword = this.passwordEncoder.encode(request.password());
        User user = this.userMapper.toDomain(request, hashedPassword, userType);

        // Generate and set verification code
        user.setVerificationCode(VerificationUtils.generateVerificationCode());
        user.setVerificationCodeExpiresAt(VerificationUtils.generateVerificationCodeExpiresAt());

        if (userType == UserType.ADMIN || "dev".equals(this.activeProfile)) {
            user.setVerified(true);
        } else {
            user.setVerified(false);
        }

        return this.userMapper.toPublicUserDTO(this.userRepository.save(user));
    }

    /**
     * Generates a verification code for the user with the specified email.
     * 
     * @param email the email of the user to generate a verification code for
     * 
     * @return a VerificationCode containing the generated verification code and its expiration time
     */
    public VerificationCode generateVerificationCode(String email) {
        User user = this.getUserByEmail(email);
        String verificationCode = VerificationUtils.generateVerificationCode();
        Instant verificationCodeExpiresAt = VerificationUtils.generateVerificationCodeExpiresAt();

        user.setVerificationCode(verificationCode);
        user.setVerificationCodeExpiresAt(verificationCodeExpiresAt);

        this.userRepository.save(user);

        return new VerificationCode(
            verificationCode,
            verificationCodeExpiresAt
        );
    }

    /**
     * Updates the user with the specified username.
     *
     * @param username the username of the user to update
     * @param request the UpdateUserRequest containing the updated user information
     * 
     * @return a PublicUserDTO containing the updated user's public information
     * @throws UsernameNotFoundException
     * @throws ResponseStatusException
     */
    public PublicUserDTO updateUser(
        String username, UpdateUserRequest request
    ) throws UsernameNotFoundException, ResponseStatusException {
        User user = this.getUserByUsername(username);
        User authUser = this.getAuthenticatedUser();

        if (!authUser.equals(user)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not allowed to update this user");
        }

        this.updateUserFields(user, request);
        return this.userMapper.toPublicUserDTO(this.userRepository.save(user));
    }

    /**
     * Deletes the user with the specified username.
     *
     * @param username the username of the user to delete
     * 
     * @throws UsernameNotFoundException
     * @throws ResponseStatusException
     */
    public void deleteUser(String username) throws UsernameNotFoundException, ResponseStatusException {
        User user = this.getUserByUsername(username);
        User authUser = this.getAuthenticatedUser();

        if (!authUser.equals(user) && !authUser.isAdmin()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not allowed to delete this user");
        }

        this.userRepository.delete(user);
    }

    /**
     * Uploads an avatar for the authenticated user.
     *
     * @param username the username of the user to upload the avatar for
     * @param avatar the MultipartFile containing the avatar image
     * 
     * @return a PublicUserDTO containing the updated user's public information
     * @throws ResponseStatusException
     * @throws Exception
     */
    public PublicUserDTO uploadAvatar(String username, MultipartFile avatar) throws Exception {
        User user = this.getUserByUsername(username);
        User authUser = this.getAuthenticatedUser();

        if (!authUser.equals(user)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not allowed to upload an avatar for this user");
        }

        if (avatar.getContentType() == null || !avatar.getContentType().startsWith("image/")) {
            throw new ResponseStatusException(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "Only image files are allowed");
        }

        user.setAvatar(ImageUtils.toByteArray(avatar));
        return this.userMapper.toPublicUserDTO(this.userRepository.save(user));
    }

    /**
     * Retrieves the avatar of the user with the specified username.
     *
     * @param username the username of the user to retrieve the avatar for
     * 
     * @return a Resource containing the avatar image
     * @throws UsernameNotFoundException
     * @throws SQLException
     */
    public Resource getAvatar(String username) throws UsernameNotFoundException, SQLException {
        User user = this.getUserByUsername(username);
        if (user.getAvatar() == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User avatar not found");
        }

        return ImageUtils.toResource(user.getAvatar());
    }

    /**
     * Retrieves the currently authenticated user.
     *
     * @return the authenticated User object, or null if no user is authenticated
     */
    public User getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        // Check if user is authenticated and return the user
        if (auth != null && !(auth instanceof AnonymousAuthenticationToken)) {
            return this.userRepository.findByUsername(auth.getName()).get();
        }

        return null;
    }

    /**
     * Sets the processing AI flag for the user with the specified username.
     *
     * @param username the username of the user to update
     * @param processing the processing AI flag to set
     */
    public void setProcessingAI(String username, boolean processing) {
        User user = this.getUserByUsername(username);
        user.setProcessingAI(processing);
        this.userRepository.save(user);
    }

    /**
     * Verifies a user's account using the provided code.
     * 
     * @param usernameOrEmail the username or email of the user to verify
     * @param code the verification code
     * 
     * @throws UsernameNotFoundException
     * @throws IllegalArgumentException
     */
    public PublicUserDTO verifyUser(
        String usernameOrEmail, String code
    )throws UsernameNotFoundException, IllegalArgumentException {
        User user;
        user = this.getUserByUsername(usernameOrEmail);
        if (user == null) {
            user = this.getUserByEmail(usernameOrEmail);
        }
        
        if (user == null) {
            throw new UsernameNotFoundException("User not found");
        }

        if (user.getVerified()) {
             throw new IllegalArgumentException("User is already verified");
        }

        if (user.getVerificationCode() == null || !user.getVerificationCode().equals(code)) {
            throw new IllegalArgumentException("Invalid verification code");
        }

        if (user.getVerificationCodeExpiresAt().isBefore(Instant.now())) {
            throw new IllegalArgumentException("Verification code has expired");
        }

        user.setVerified(true);
        user.setVerificationCode(null);
        user.setVerificationCodeExpiresAt(null);
        return this.userMapper.toPublicUserDTO(this.userRepository.save(user));
    }

    /**
     * Updates the fields of a user entity based on the provided PublicUserDTO.
     *
     * @param user the User entity to update
     * @param request the UpdateUserRequest containing the updated user information
     */
    private void updateUserFields(User user, UpdateUserRequest request) {
        if (request.name() != null) {
            user.setName(request.name());
        }
        if (request.description() != null) {
            user.setDescription(request.description());
        }
        if (request.location() != null) {
            user.setLocation(request.location());
        }
        if (request.notificationsAllowed() != null) {
            user.setNotificationsAllowed(request.notificationsAllowed());
        }
    }
}