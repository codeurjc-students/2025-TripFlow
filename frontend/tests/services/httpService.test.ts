import { beforeEach, describe, expect, it, vi } from "vitest";

import { http, OfflineReadOnlyError } from "@/services/httpService";
import { offlineCacheService } from "@/services/offlineCacheService";

describe("http offline behavior", () => {
    beforeEach(() => {
        localStorage.clear();
        offlineCacheService.clearMemory();
        vi.restoreAllMocks();
    });

    it("blocks non-GET requests while offline", async () => {
        Object.defineProperty(navigator, "onLine", {
            configurable: true,
            value: false,
        });

        await expect(http("/api/v1/itineraries", "POST", { title: "x" })).rejects.toBeInstanceOf(OfflineReadOnlyError);
    });

    it("returns cached GET response while offline", async () => {
        const path = "/api/v1/itineraries?page=0&size=10";
        const payload = { page: [{ id: 1 }], totalItems: 1 };

        offlineCacheService.set(path, payload, 60_000);
        Object.defineProperty(navigator, "onLine", {
            configurable: true,
            value: false,
        });

        const response = await http<typeof payload>(path, "GET");
        expect(response).toEqual(payload);
    });

    it("falls back to cached GET when network request fails", async () => {
        const path = "/api/v1/itineraries/1";
        const payload = { id: 1, title: "Cached" };

        offlineCacheService.set(path, payload, 60_000);
        Object.defineProperty(navigator, "onLine", {
            configurable: true,
            value: true,
        });

        vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Network failed")));

        const response = await http<typeof payload>(path, "GET");
        expect(response).toEqual(payload);
    });
});
