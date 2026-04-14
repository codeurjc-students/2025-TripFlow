package com.tripflow.repository;

import java.time.Instant;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tripflow.model.MapsCacheEntry;

public interface MapsCacheRepository extends JpaRepository<MapsCacheEntry, Long> {
    Optional<MapsCacheEntry> findByCacheKeyAndExpiresAtAfter(String cacheKey, Instant now);
    Optional<MapsCacheEntry> findByCacheKey(String cacheKey);
    long deleteByExpiresAtBefore(Instant now);
}
