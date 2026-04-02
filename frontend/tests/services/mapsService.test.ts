import { describe, expect, it, vi } from "vitest";

import { getDirections, retrievePlace, suggestPlaces } from "@/services/mapsService";

const httpMock = vi.fn();

vi.mock("@services/httpService", () => ({
    http: (...args: unknown[]) => httpMock(...args),
}));

describe("mapsService", () => {
    it("builds suggest query with provided filters", async () => {
        httpMock.mockResolvedValue({ suggestions: [] });

        await suggestPlaces({ q: "coffee", lat: 40.4, lon: -3.7, radiusKm: 10 });

        expect(httpMock).toHaveBeenCalledWith(
            "/api/v1/maps/search/suggest?q=coffee&lat=40.4&lon=-3.7&radiusKm=10",
            "GET"
        );
    });

    it("calls retrieve endpoint with encoded id", async () => {
        httpMock.mockResolvedValue({});

        await retrievePlace("abc/123", "es");

        expect(httpMock).toHaveBeenCalledWith("/api/v1/maps/search/retrieve/abc%2F123?language=es", "GET");
    });

    it("calls directions endpoint with post body", async () => {
        httpMock.mockResolvedValue({ routes: [] });

        await getDirections({
            profile: "DRIVING",
            waypoints: [
                { latitude: 40.4, longitude: -3.7 },
                { latitude: 41.4, longitude: -2.7 },
            ],
            alternatives: false,
            steps: false,
        });

        expect(httpMock).toHaveBeenCalledWith(
            "/api/v1/maps/directions",
            "POST",
            {
                profile: "DRIVING",
                waypoints: [
                    { latitude: 40.4, longitude: -3.7 },
                    { latitude: 41.4, longitude: -2.7 },
                ],
                alternatives: false,
                steps: false,
            }
        );
    });
});
