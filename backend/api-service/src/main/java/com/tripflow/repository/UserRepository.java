package com.tripflow.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.tripflow.model.User;
import com.tripflow.model.types.UserType;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);

    @Query("""
        SELECT u FROM User u 
        WHERE u.role = :role 
        AND (:search IS NULL OR LOWER(u.username) LIKE :search)
    """)
    Page<User> findAllByRoleAndUsernameContaining(
        @Param("role") UserType role, 
        @Param("search") String search, 
        Pageable pageable
    );

    List<User> findByVerifiedFalseAndCreatedAtBefore(LocalDateTime expiryDate); 

    @Query("SELECT u.plan, COUNT(u) FROM User u GROUP BY u.plan")
    List<Object[]> countUsersByPlan();
}
