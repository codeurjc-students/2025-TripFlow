import { beforeEach, describe, expect, it } from "vitest";

import {
    buildDirectionsCacheKey,
    getCachedDirectionsPath,
    setCachedDirectionsPath,
} from "@/services/mapDirectionsCache";
import { offlineCacheService } from "@/services/offlineCacheService";

describe("mapDirectionsCache", () => {
    beforeEach(() => {
        localStorage.clear();
        offlineCacheService.clearMemory();
    });

    it("builds deterministic keys for equivalent waypoint precision", () => {
        const keyA = buildDirectionsCacheKey({
            profile: "DRIVING",
            waypoints: [
                [40.41680001, -3.70380009],
                [41.0, -2.0],
            ],
            alternatives: false,
            steps: false,
        });

        const keyB = buildDirectionsCacheKey({
            profile: "DRIVING",
            waypoints: [
                [40.41680002, -3.70380008],
                [41.0, -2.0],
            ],
            alternatives: false,
            steps: false,
        });

        expect(keyA).toBe(keyB);
    });

    it("stores and retrieves cached route path", () => {
        const key = buildDirectionsCacheKey({
            profile: "DRIVING",
            waypoints: [
                [40.4168, -3.7038],
                [41.0, -2.0],
            ],
            alternatives: false,
            steps: false,
        });
        const path: [number, number][] = [
            [40.4168, -3.7038],
            [40.7, -3.2],
            [41.0, -2.0],
        ];

        setCachedDirectionsPath(key, path);

        expect(getCachedDirectionsPath(key)).toEqual(path);
    });
});
