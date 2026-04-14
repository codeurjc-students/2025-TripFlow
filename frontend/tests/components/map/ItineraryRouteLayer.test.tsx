import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { LatLngTuple } from "leaflet";
import ItineraryRouteLayer from "@/components/map/ItineraryRouteLayer";

const leafletMocks = vi.hoisted(() => ({
    addTo: vi.fn(),
    remove: vi.fn(),
    polylineMock: vi.fn(() => ({ addTo: vi.fn(), remove: vi.fn() })),
}));

vi.mock("leaflet", () => ({
    default: {
        polyline: leafletMocks.polylineMock,
    },
}));

describe("ItineraryRouteLayer", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("draws polyline when not hidden", () => {
        const map = {} as any;
        const path: LatLngTuple[] = [
            [40, -3],
            [41, -2],
        ];

        render(<ItineraryRouteLayer map={map} path={path} />);

        expect(leafletMocks.polylineMock).toHaveBeenCalledWith(path, expect.any(Object));
    });

    it("skips polyline when hidden", () => {
        const map = {} as any;
        const path: LatLngTuple[] = [
            [40, -3],
            [41, -2],
        ];

        render(<ItineraryRouteLayer map={map} path={path} isHidden />);

        expect(leafletMocks.polylineMock).not.toHaveBeenCalled();
    });
});
