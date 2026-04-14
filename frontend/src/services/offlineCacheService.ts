import { STORAGE_KEYS } from "@/constants/storageKeys";

interface CacheEnvelope<T> {
    data: T;
    cachedAt: number;
    expiresAt: number;
    version: string;
}

export interface CacheResult<T> {
    data: T;
    cachedAt: number;
    expiresAt: number;
    isStale: boolean;
}

const memoryCache = new Map<string, CacheEnvelope<unknown>>();

function getStorageKey(key: string): string {
    return `${STORAGE_KEYS.OFFLINE_CACHE_PREFIX}:${key}`;
}

function parseEnvelope<T>(raw: string | null): CacheEnvelope<T> | null {
    if (!raw) return null;

    try {
        const parsed = JSON.parse(raw) as CacheEnvelope<T>;
        if (!parsed || parsed.version !== STORAGE_KEYS.OFFLINE_CACHE_VERSION) {
            return null;
        }

        return parsed;
    } catch {
        return null;
    }
}

export const offlineCacheService = {
    get<T>(key: string): CacheResult<T> | null {
        const inMemory = memoryCache.get(key) as CacheEnvelope<T> | undefined;
        if (inMemory) {
            return {
                data: inMemory.data,
                cachedAt: inMemory.cachedAt,
                expiresAt: inMemory.expiresAt,
                isStale: Date.now() > inMemory.expiresAt,
            };
        }

        const storageKey = getStorageKey(key);
        const fromStorage = parseEnvelope<T>(localStorage.getItem(storageKey));
        if (!fromStorage) return null;

        memoryCache.set(key, fromStorage as CacheEnvelope<unknown>);

        return {
            data: fromStorage.data,
            cachedAt: fromStorage.cachedAt,
            expiresAt: fromStorage.expiresAt,
            isStale: Date.now() > fromStorage.expiresAt,
        };
    },

    set<T>(key: string, data: T, ttlMs: number): void {
        const now = Date.now();
        const envelope: CacheEnvelope<T> = {
            data,
            cachedAt: now,
            expiresAt: now + ttlMs,
            version: STORAGE_KEYS.OFFLINE_CACHE_VERSION,
        };

        memoryCache.set(key, envelope as CacheEnvelope<unknown>);

        try {
            localStorage.setItem(getStorageKey(key), JSON.stringify(envelope));
        } catch {
            // Ignore quota errors: memory cache still helps until refresh.
        }
    },

    clearMemory(): void {
        memoryCache.clear();
    },

    getMetadata(key: string): Omit<CacheResult<unknown>, "data"> | null {
        const cached = this.get<unknown>(key);
        if (!cached) return null;

        return {
            cachedAt: cached.cachedAt,
            expiresAt: cached.expiresAt,
            isStale: cached.isStale,
        };
    },
};
