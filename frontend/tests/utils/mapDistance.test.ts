import { describe, expect, it } from "vitest";

import { haversineDistanceKm } from "@/utils/mapDistance";

describe("haversineDistanceKm", () => {
    it("returns zero for identical coordinates", () => {
        const distance = haversineDistanceKm(40.4168, -3.7038, 40.4168, -3.7038);
        expect(distance).toBeCloseTo(0, 6);
    });

    it("returns approximate distance for nearby points", () => {
        const distance = haversineDistanceKm(40.4168, -3.7038, 40.4218, -3.7038);
        expect(distance).toBeGreaterThan(0.5);
        expect(distance).toBeLessThan(0.7);
    });
});
