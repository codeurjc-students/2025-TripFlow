package com.tripflow.service.map;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.HexFormat;
import java.util.Optional;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.tripflow.model.MapsCacheEntry;
import com.tripflow.repository.MapsCacheRepository;

import jakarta.transaction.Transactional;

@Service
public class MapsCacheService {

    private final MapsCacheRepository mapsCacheRepository;

    public MapsCacheService(MapsCacheRepository mapsCacheRepository) {
        this.mapsCacheRepository = mapsCacheRepository;
    }

    public Optional<String> getValidPayload(String cacheKey) {
        return this.mapsCacheRepository.findByCacheKeyAndExpiresAtAfter(cacheKey, Instant.now())
            .map(MapsCacheEntry::getPayload);
    }

    @Transactional
    public void save(String cacheKey, String endpoint, String payload, long ttlSeconds) {
        Instant expiresAt = Instant.now().plusSeconds(Math.max(ttlSeconds, 1));

        MapsCacheEntry entry = this.mapsCacheRepository.findByCacheKey(cacheKey)
            .orElseGet(() -> new MapsCacheEntry(cacheKey, endpoint, payload, expiresAt));

        entry.setEndpoint(endpoint);
        entry.setPayload(payload);
        entry.setExpiresAt(expiresAt);

        this.mapsCacheRepository.save(entry);
    }

    public static String buildCacheKey(String key) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(key.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("Unable to hash cache key", ex);
        }
    }

    @Scheduled(fixedDelayString = "${maps.cache.cleanup-ms:3600000}")
    @Transactional
    public void cleanupExpiredEntries() {
        this.mapsCacheRepository.deleteByExpiresAtBefore(Instant.now());
    }
}
