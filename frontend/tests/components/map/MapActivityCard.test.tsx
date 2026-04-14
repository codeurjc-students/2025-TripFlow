import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { MapWaypoint } from "@/utils/mapGeometry";
import MapActivityCard from "@/components/map/MapActivityCard";

function makeWaypoint(overrides: Partial<MapWaypoint> = {}): MapWaypoint {
    return {
        dayNumber: 1,
        activityIndex: 0,
        position: [40, -3],
        activity: {
            activity: "Museo",
            details: "Detalles",
            location: {
                name: "Madrid",
                address: "Calle 1",
                coordinates: { latitude: 40, longitude: -3 },
            },
            time: "09:00",
            duration: "2h",
        },
        ...overrides,
    };
}

describe("MapActivityCard", () => {
    it("renders activity info and triggers click", () => {
        const onClick = vi.fn();

        render(
            <MapActivityCard
                waypoint={makeWaypoint()}
                isSelected={false}
                onClick={onClick}
            />
        );

        const button = screen.getByRole("button", { name: /Museo - Madrid/ });
        expect(button).toHaveAttribute("aria-pressed", "false");

        fireEvent.click(button);
        expect(onClick).toHaveBeenCalled();
        expect(screen.getByText("09:00")).toBeInTheDocument();
        expect(screen.getByText("2h")).toBeInTheDocument();
    });

    it("falls back to Sin hora when time is missing", () => {
        render(
            <MapActivityCard
                waypoint={makeWaypoint({ activity: { ...makeWaypoint().activity, time: "" } })}
                isSelected={true}
                onClick={vi.fn()}
            />
        );

        expect(screen.getByText("Sin hora")).toBeInTheDocument();
    });

    it("handles null-like activity values with safe fallbacks", () => {
        const onClick = vi.fn();
        const waypoint = makeWaypoint();

        render(
            <MapActivityCard
                waypoint={{
                    ...waypoint,
                    activity: {
                        ...waypoint.activity,
                        activity: null as unknown as string,
                        location: {
                            ...waypoint.activity.location,
                            name: null as unknown as string,
                            address: null as unknown as string,
                        },
                        time: null as unknown as string,
                        duration: null as unknown as string,
                    },
                }}
                isSelected={false}
                onClick={onClick}
            />
        );

        const button = screen.getByRole("button", { name: /Actividad - Ubicacion/ });
        expect(screen.getByText("Actividad")).toBeInTheDocument();
        expect(screen.getByText("Sin hora")).toBeInTheDocument();

        fireEvent.click(button);
        expect(onClick).toHaveBeenCalled();
    });
});
