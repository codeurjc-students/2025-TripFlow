package com.tripflow.unit;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.tripflow.dto.user.PublicUserDTO;
import com.tripflow.dto.user.RegisterUserRequest;
import com.tripflow.exception.EmailAlreadyExistsException;
import com.tripflow.exception.UsernameAlreadyExistsException;
import com.tripflow.mappers.UserMapper;
import com.tripflow.model.User;
import com.tripflow.model.types.UserType;
import com.tripflow.repository.UserRepository;
import com.tripflow.service.UserService;

import java.sql.SQLException;
import java.util.List;

import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.tripflow.dto.shared.PaginatedDTO;
import com.tripflow.dto.user.UpdateUserRequest;

@Tag("unit")
public class UserServiceTest {
    private UserRepository userRepository;
    private UserMapper userMapper;
    private PasswordEncoder passwordEncoder;
    private UserService userService;

    @BeforeEach
    public void setUp() {
        this.userRepository = mock(UserRepository.class);
        this.userMapper = mock(UserMapper.class);
        this.passwordEncoder = mock(PasswordEncoder.class);

        this.userService = new UserService(userRepository, userMapper, passwordEncoder);
    }

    @Test
    @DisplayName("UserService should get public user by username")
    public void testGetPublicUserByUsername() {
        User user = new User();
        user.setUsername("testuser");

        PublicUserDTO publicUserDTO = mock(PublicUserDTO.class);

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(userMapper.toPublicUserDTO(user)).thenReturn(publicUserDTO);

        PublicUserDTO result = userService.getPublicUserByUsername("testuser");

        assertNotNull(result);
        assertEquals(publicUserDTO, result);
        verify(userRepository).findByUsername("testuser");
        verify(userMapper).toPublicUserDTO(user);
    }

    @Test
    @DisplayName("UserService should throw UsernameNotFoundException when user not found")
    public void testGetPublicUserByUsernameNotFound() {
        when(userRepository.findByUsername("nonexistent")).thenReturn(Optional.empty());

        assertThrows(UsernameNotFoundException.class, () ->
            userService.getPublicUserByUsername("nonexistent")
        );
    }

    @Test
    @DisplayName("UserService should register new user")
    public void testRegisterUser() {
        RegisterUserRequest request = new RegisterUserRequest(
            "newuser@example.com", "newuser", "password123", "password123"
        );

        when(userRepository.existsByUsername("newuser")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("hashedPassword");

        User user = new User();
        user.setUsername("newuser");

        PublicUserDTO publicUserDTO = mock(PublicUserDTO.class);

        when(userMapper.toDomain(request, "hashedPassword", UserType.USER)).thenReturn(user);
        when(userRepository.save(user)).thenReturn(user);
        when(userMapper.toPublicUserDTO(user)).thenReturn(publicUserDTO);

        PublicUserDTO result = userService.registerUser(request);

        assertNotNull(result);
        assertEquals(publicUserDTO, result);
        verify(passwordEncoder).encode("password123");
        verify(userRepository).save(user);
    }

    @Test
    @DisplayName("UserService should throw exception when email already exists")
    public void testRegisterUserEmailAlreadyExists() {
        RegisterUserRequest request = new RegisterUserRequest(
            "existingemail@example.com", "newuser", "password123", "password123"
        );

        when(userRepository.existsByEmail("existingemail@example.com")).thenReturn(true);

        EmailAlreadyExistsException ex = assertThrows(EmailAlreadyExistsException.class, () ->
            userService.registerUser(request)
        );
        assertEquals("User already exists with email", ex.getMessage());
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("UserService should throw exception when username already exists")
    public void testRegisterUserAlreadyExists() {
        RegisterUserRequest request = new RegisterUserRequest(
            "existinguser@example.com", "existinguser", "password123", "password123"
        );

        when(userRepository.existsByUsername("existinguser")).thenReturn(true);

        UsernameAlreadyExistsException ex = assertThrows(UsernameAlreadyExistsException.class, () ->
            userService.registerUser(request)
        );
        assertEquals("User already exists with username", ex.getMessage());
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("UserService should get authenticated user")
    public void testGetAuthenticatedUser() {
        User user = new User();
        user.setUsername("authenticateduser");

        Authentication auth = new UsernamePasswordAuthenticationToken("authenticateduser", null);
        SecurityContext securityContext = mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(auth);
        SecurityContextHolder.setContext(securityContext);

        when(userRepository.findByUsername("authenticateduser")).thenReturn(Optional.of(user));

        User result = userService.getAuthenticatedUser();

        assertNotNull(result);
        assertEquals("authenticateduser", result.getUsername());
    }

    @Test
    @DisplayName("UserService should return null when no user is authenticated")
    public void testGetAuthenticatedUserNotAuthenticated() {
        SecurityContext securityContext = mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(null);
        SecurityContextHolder.setContext(securityContext);

        User result = userService.getAuthenticatedUser();

        assertNull(result);
    }

    @Test
    @DisplayName("UserService should return null for anonymous authentication")
    public void testGetAuthenticatedUserAnonymous() {
        Authentication auth = mock(AnonymousAuthenticationToken.class);
        SecurityContext securityContext = mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(auth);
        SecurityContextHolder.setContext(securityContext);

        User result = userService.getAuthenticatedUser();

        assertNull(result);
    }

    @Test
    @DisplayName("UserService should hash password when registering user")
    public void testRegisterUserPasswordHashing() {
        RegisterUserRequest request = new RegisterUserRequest(
            "testuser@example.com", "testuser", "plainPassword", "plainPassword"
        );

        when(userRepository.existsByUsername("testuser")).thenReturn(false);
        when(passwordEncoder.encode("plainPassword")).thenReturn("$2a$10$hashedPassword");

        User user = new User();
        PublicUserDTO publicUserDTO = mock(PublicUserDTO.class);

        when(userMapper.toDomain(eq(request), eq("$2a$10$hashedPassword"), eq(UserType.USER))).thenReturn(user);
        when(userRepository.save(user)).thenReturn(user);
        when(userMapper.toPublicUserDTO(user)).thenReturn(publicUserDTO);

        userService.registerUser(request);

        verify(passwordEncoder).encode("plainPassword");
        verify(userMapper).toDomain(request, "$2a$10$hashedPassword", UserType.USER);
    }

    @Test
    @DisplayName("UserService should get user entity by username")
    public void testGetUserByUsername() {
        User user = new User();
        user.setUsername("testuser");

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));

        User result = userService.getUserByUsername("testuser");

        assertNotNull(result);
        assertEquals("testuser", result.getUsername());
        verify(userRepository).findByUsername("testuser");
    }

    @Test
    @DisplayName("UserService should throw UsernameNotFoundException when user entity not found")
    public void testGetUserByUsernameNotFound() {
        when(userRepository.findByUsername("nonexistent")).thenReturn(Optional.empty());

        assertThrows(UsernameNotFoundException.class, () ->
            userService.getUserByUsername("nonexistent")
        );
    }

    @Test
    @DisplayName("UserService should get all users paginated")
    public void testGetAllUsers() {
        Pageable pageable = mock(Pageable.class);
        @SuppressWarnings("unchecked")
        Page<User> usersPage = mock(Page.class);
        User user = new User();
        List<User> users = List.of(user);
        PublicUserDTO publicUserDTO = mock(PublicUserDTO.class);
        List<PublicUserDTO> publicUserDTOs = List.of(publicUserDTO);

        when(userRepository.findAllByRoleAndUsernameContaining(
            UserType.USER, null, pageable
        )).thenReturn(usersPage);
        when(usersPage.getContent()).thenReturn(users);
        when(userMapper.toPublicUserDTOs(users)).thenReturn(publicUserDTOs);
        
        when(usersPage.getNumber()).thenReturn(0);
        when(usersPage.getTotalPages()).thenReturn(1);
        when(usersPage.getTotalElements()).thenReturn(1L);
        when(usersPage.getSize()).thenReturn(10);
        when(usersPage.isLast()).thenReturn(true);

        PaginatedDTO<PublicUserDTO> result = userService.getAllUsers(pageable, null);

        assertNotNull(result);
        assertEquals(1, result.page().size());
        assertEquals(publicUserDTO, result.page().get(0));
        verify(userRepository).findAllByRoleAndUsernameContaining(UserType.USER, null, pageable);
    }

    @Test
    @DisplayName("UserService should update user")
    public void testUpdateUser() {
        String username = "testuser";
        UpdateUserRequest request = new UpdateUserRequest("New Name", "New Desc", "New Loc", true);
        User user = new User();
        user.setUsername(username);
        
        Authentication auth = new UsernamePasswordAuthenticationToken(username, null);
        SecurityContext securityContext = mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(auth);
        SecurityContextHolder.setContext(securityContext);

        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
        when(userRepository.save(user)).thenReturn(user);
        PublicUserDTO publicUserDTO = mock(PublicUserDTO.class);
        when(userMapper.toPublicUserDTO(user)).thenReturn(publicUserDTO);

        PublicUserDTO result = userService.updateUser(username, request);

        assertNotNull(result);
        assertEquals("New Name", user.getName());
        assertEquals("New Desc", user.getDescription());
        assertEquals("New Loc", user.getLocation());
        verify(userRepository).save(user);
    }

    @Test
    @DisplayName("UserService should throw Forbidden when updating another user")
    public void testUpdateUserForbidden() {
        String username = "testuser";
        String otherUsername = "otheruser";
        UpdateUserRequest request = mock(UpdateUserRequest.class);
        
        User user = new User();
        user.setUsername(username);
        
        User otherUser = new User();
        otherUser.setUsername(otherUsername);

        Authentication auth = new UsernamePasswordAuthenticationToken(otherUsername, null);
        SecurityContext securityContext = mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(auth);
        SecurityContextHolder.setContext(securityContext);

        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
        when(userRepository.findByUsername(otherUsername)).thenReturn(Optional.of(otherUser));

        assertThrows(ResponseStatusException.class, () ->
            userService.updateUser(username, request)
        );
    }

    @Test
    @DisplayName("UserService should delete user")
    public void testDeleteUser() {
        String username = "testuser";
        User user = new User();
        user.setUsername(username);

        Authentication auth = new UsernamePasswordAuthenticationToken(username, null);
        SecurityContext securityContext = mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(auth);
        SecurityContextHolder.setContext(securityContext);

        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));

        userService.deleteUser(username);

        verify(userRepository).delete(user);
    }

    @Test
    @DisplayName("UserService should throw Forbidden when deleting another user")
    public void testDeleteUserForbidden() {
        String username = "testuser";
        String otherUsername = "otheruser";
        
        User user = new User();
        user.setUsername(username);
        
        User otherUser = new User();
        otherUser.setUsername(otherUsername);
        otherUser.setRole(UserType.USER);

        Authentication auth = new UsernamePasswordAuthenticationToken(otherUsername, null);
        SecurityContext securityContext = mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(auth);
        SecurityContextHolder.setContext(securityContext);

        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
        when(userRepository.findByUsername(otherUsername)).thenReturn(Optional.of(otherUser));

        assertThrows(ResponseStatusException.class, () ->
            userService.deleteUser(username)
        );
    }

    @Test
    @DisplayName("UserService should upload avatar")
    public void testUploadAvatar() throws Exception {
        String username = "testuser";
        MultipartFile avatar = mock(MultipartFile.class);
        byte[] avatarBytes = "avatar".getBytes();
        
        User user = new User();
        user.setUsername(username);
        
        Authentication auth = new UsernamePasswordAuthenticationToken(username, null);
        SecurityContext securityContext = mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(auth);
        SecurityContextHolder.setContext(securityContext);

        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
        when(avatar.getBytes()).thenReturn(avatarBytes);
        when(avatar.getContentType()).thenReturn("image/jpeg");
        when(userRepository.save(user)).thenReturn(user);
        PublicUserDTO publicUserDTO = mock(PublicUserDTO.class);
        when(userMapper.toPublicUserDTO(user)).thenReturn(publicUserDTO);

        PublicUserDTO result = userService.uploadAvatar(username, avatar);

        assertNotNull(result);
        assertArrayEquals(avatarBytes, user.getAvatar());
        verify(userRepository).save(user);
    }

    @Test
    @DisplayName("UserService should throw Forbidden when uploading avatar for another user")
    public void testUploadAvatarForbidden() {
        String username = "testuser";
        String otherUsername = "otheruser";
        MultipartFile avatar = mock(MultipartFile.class);
        
        User user = new User();
        user.setUsername(username);
        
        User otherUser = new User();
        otherUser.setUsername(otherUsername);

        Authentication auth = new UsernamePasswordAuthenticationToken(otherUsername, null);
        SecurityContext securityContext = mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(auth);
        SecurityContextHolder.setContext(securityContext);

        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
        when(userRepository.findByUsername(otherUsername)).thenReturn(Optional.of(otherUser));

        assertThrows(ResponseStatusException.class, () ->
            userService.uploadAvatar(username, avatar)
        );
    }

    @Test
    @DisplayName("UserService should get avatar")
    public void testGetAvatar() throws SQLException {
        String username = "testuser";
        byte[] avatarBytes = "avatar".getBytes();
        User user = new User();
        user.setUsername(username);
        user.setAvatar(avatarBytes);

        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));

        Resource result = userService.getAvatar(username);

        assertNotNull(result);
    }

    @Test
    @DisplayName("UserService should throw NotFound when avatar not found")
    public void testGetAvatarNotFound() {
        String username = "testuser";
        User user = new User();
        user.setUsername(username);
        user.setAvatar(null);

        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));

        assertThrows(ResponseStatusException.class, () ->
            userService.getAvatar(username)
        );
    }
}