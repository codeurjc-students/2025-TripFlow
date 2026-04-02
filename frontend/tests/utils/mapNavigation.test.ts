import { describe, expect, it } from "vitest";

import { buildExternalNavigationUrl } from "@/utils/mapNavigation";

const place = {
    id: "poi",
    name: "Museo",
    fullAddress: "Address",
    placeFormatted: "Madrid",
    featureType: "poi",
    categories: ["museum"],
    center: { latitude: 40.4, longitude: -3.7 },
};

describe("buildExternalNavigationUrl", () => {
    it("uses walking travel mode when profile is WALKING", () => {
        const url = buildExternalNavigationUrl(place, { latitude: 40.3, longitude: -3.6 }, "WALKING");
        expect(url).toContain("travelmode=walking");
    });

    it("uses bicycling travel mode when profile is CYCLING", () => {
        const url = buildExternalNavigationUrl(place, { latitude: 40.3, longitude: -3.6 }, "CYCLING");
        expect(url).toContain("travelmode=bicycling");
    });

    it("falls back to driving mode for DRIVING_TRAFFIC", () => {
        const url = buildExternalNavigationUrl(place, { latitude: 40.3, longitude: -3.6 }, "DRIVING_TRAFFIC");
        expect(url).toContain("travelmode=driving");
    });
});
