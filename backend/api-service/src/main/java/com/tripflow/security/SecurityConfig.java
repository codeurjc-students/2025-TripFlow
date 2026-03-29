package com.tripflow.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.tripflow.security.jwt.JwtRequestFilter;
import com.tripflow.security.jwt.UnauthorizedHandlerJwt;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private CustomUserDetailsService detailsService;

    @Autowired
    private JwtRequestFilter jwtRequestFilter;

    @Autowired
    private UnauthorizedHandlerJwt unauthorizedHandler;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider(detailsService);
        authProvider.setPasswordEncoder(passwordEncoder());

        return authProvider;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.authorizeHttpRequests(authorize -> authorize
            .requestMatchers(
                "/swagger-ui.html", "/swagger-ui/**", "/v3/api-docs/**",
                "/v3/api-docs.yaml", "/api-docs", "/api-docs/**"
            ).permitAll()
            .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
            .requestMatchers(HttpMethod.POST, "/api/auth/**").permitAll()
            .requestMatchers(HttpMethod.GET, "/api/health/**").permitAll()
            .requestMatchers(HttpMethod.GET, "/api/v1/users").authenticated()
            .requestMatchers(HttpMethod.GET, "/api/v1/users/*/invitations").authenticated()
            .requestMatchers(HttpMethod.GET, "/api/v1/users/*/avatar").permitAll()
            .requestMatchers(HttpMethod.GET, "/api/v1/users/*").permitAll()
            .requestMatchers(HttpMethod.GET, "/api/v1/share/**").permitAll()
            .requestMatchers(HttpMethod.POST, "/api/v1/users/**").authenticated()
            .requestMatchers(HttpMethod.PUT, "/api/v1/users/**").authenticated()
            .requestMatchers(HttpMethod.DELETE, "/api/v1/users/**").authenticated()
            .requestMatchers(HttpMethod.GET, "/api/v1/itineraries/**").authenticated()
            .requestMatchers(HttpMethod.POST, "/api/v1/itineraries/**").authenticated()
            .requestMatchers(HttpMethod.PUT, "/api/v1/itineraries/**").authenticated()
            .requestMatchers(HttpMethod.DELETE, "/api/v1/itineraries/**").authenticated()
            .requestMatchers(HttpMethod.GET, "/api/v1/maps/**").authenticated()
            .requestMatchers(HttpMethod.POST, "/api/v1/maps/**").authenticated()
            .requestMatchers(HttpMethod.GET, "/api/v1/stats/**").authenticated()
            .requestMatchers(HttpMethod.POST, "/api/v1/ai/**").authenticated()
            .requestMatchers(HttpMethod.GET, "/api/v1/ai/**").authenticated()
            .anyRequest().authenticated()
        );

        http.authenticationProvider(authenticationProvider());
        http.sessionManagement(management -> management.sessionCreationPolicy(SessionCreationPolicy.STATELESS));
        http.exceptionHandling(handling -> handling.authenticationEntryPoint(unauthorizedHandler));
        http.addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);
        http.formLogin(formlogin -> formlogin.disable());
        http.httpBasic(httpBasic -> httpBasic.disable());
        http.csrf(csrf -> csrf.disable());
        http.cors(cors -> {});

        return http.build();
    }
}
