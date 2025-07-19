package com.tripflow.security;

import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.tripflow.model.User;
import com.tripflow.repository.UserRepository;

@Service
public class CustomUserDetailsService implements UserDetailsService {
    private UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = this.userRepository.findByUsername(username).orElseThrow(
            () -> new UsernameNotFoundException("User not found")
        );

        // Generate the role string based on the user's role
        String role = String.format("ROLE_%s", user.getRole().name());

        // Create a list of GrantedAuthority with the user's role
        List<GrantedAuthority> roles = List.of(new SimpleGrantedAuthority(role));

        return new org.springframework.security.core.userdetails.User(
            user.getUsername(),
            user.getHashedPassword(),
            roles
        );
    }
}
