import { beforeEach, describe, expect, it } from "vitest";

import { offlineCacheService } from "@/services/offlineCacheService";

describe("offlineCacheService", () => {
    beforeEach(() => {
        localStorage.clear();
        offlineCacheService.clearMemory();
    });

    it("stores and retrieves cached data", () => {
        const key = "/api/v1/itineraries?page=0&size=10";
        const payload = { page: [], totalItems: 0 };

        offlineCacheService.set(key, payload, 60_000);

        const cached = offlineCacheService.get<typeof payload>(key);
        expect(cached).not.toBeNull();
        expect(cached?.data).toEqual(payload);
        expect(cached?.isStale).toBe(false);
    });

    it("marks entries as stale after ttl expiration", async () => {
        const key = "/api/v1/itineraries/1";

        offlineCacheService.set(key, { id: 1 }, 1);

        await new Promise((resolve) => setTimeout(resolve, 5));

        const cached = offlineCacheService.get<{ id: number }>(key);
        expect(cached?.isStale).toBe(true);
    });
});
