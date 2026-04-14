import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getPreferredDayNumber, getPreferredItineraryId, useAddPoiToTrip } from "@/hooks/useAddPoiToTrip";
import { STORAGE_KEYS } from "@/constants/storageKeys";

const {
    getUserItinerariesMock,
    getItineraryByIdMock,
    updateItineraryMock,
} = vi.hoisted(() => ({
    getUserItinerariesMock: vi.fn(),
    getItineraryByIdMock: vi.fn(),
    updateItineraryMock: vi.fn(),
}));

vi.mock("@/services/itineraryService", () => ({
    getUserItineraries: getUserItinerariesMock,
    getItineraryById: getItineraryByIdMock,
    updateItinerary: updateItineraryMock,
}));

describe("useAddPoiToTrip", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it("loads only editable itineraries", async () => {
        getUserItinerariesMock.mockResolvedValue({
            page: [
                { id: 1, title: "Editable", countDays: 2, permissions: { edit: true } },
                { id: 2, title: "Read only", countDays: 3, permissions: { edit: false } },
            ],
        });

        const { result } = renderHook(() => useAddPoiToTrip());
        let options: unknown[] = [];

        await act(async () => {
            options = await result.current.loadEditableItineraries();
        });

        expect(options).toEqual([
            { id: 1, title: "Editable", countDays: 2 },
        ]);
    });

    it("adds poi activity to selected day and persists defaults", async () => {
        getItineraryByIdMock.mockResolvedValue({
            id: 8,
            title: "Madrid",
            place: "Madrid",
            people: 2,
            budget: 1000,
            date: "2026-06-01",
            status: "PLANNED",
            countDays: 2,
            tags: [],
            coverImage: { altDescription: "", imageUrl: "", authorUsername: "" },
            permissions: { view: true, edit: true, delete: true },
            days: [
                { day: 1, activities: [] },
                { day: 2, activities: [] },
            ],
        });
        updateItineraryMock.mockResolvedValue({ id: 8 });

        const { result } = renderHook(() => useAddPoiToTrip());

        await act(async () => {
            await result.current.addPoiToTrip({
                itineraryId: 8,
                dayNumber: 2,
                time: "10:00",
                duration: "1h",
                poi: {
                    id: "poi-1",
                    name: "Museo del Prado",
                    fullAddress: "C. de Ruiz de Alarcon 23",
                    placeFormatted: "Madrid",
                    featureType: "poi",
                    categories: ["museum"],
                    center: { latitude: 40.4138, longitude: -3.6921 },
                },
            });
        });

        expect(updateItineraryMock).toHaveBeenCalledTimes(1);
        const payload = updateItineraryMock.mock.calls[0][1];
        expect(payload.days.find((day: { day: number }) => day.day === 2)?.activities).toHaveLength(1);
        expect(localStorage.getItem(STORAGE_KEYS.MAP_EXPLORE_LAST_ITINERARY_ID)).toBe("8");
        expect(localStorage.getItem(STORAGE_KEYS.MAP_EXPLORE_LAST_DAY)).toBe("2");
    });
});

describe("useAddPoiToTrip helpers", () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it("uses persisted itinerary id when available", () => {
        localStorage.setItem(STORAGE_KEYS.MAP_EXPLORE_LAST_ITINERARY_ID, "9");
        const preferred = getPreferredItineraryId([
            { id: 3, title: "A", countDays: 1 },
            { id: 9, title: "B", countDays: 2 },
        ]);
        expect(preferred).toBe(9);
    });

    it("clamps persisted day to max days", () => {
        localStorage.setItem(STORAGE_KEYS.MAP_EXPLORE_LAST_DAY, "8");
        expect(getPreferredDayNumber(3)).toBe(3);
    });
});
