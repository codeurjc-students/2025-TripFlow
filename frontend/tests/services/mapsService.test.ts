import { describe, expect, it, vi } from "vitest";

import { retrievePlace, suggestPlaces } from "@/services/mapsService";

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
});
