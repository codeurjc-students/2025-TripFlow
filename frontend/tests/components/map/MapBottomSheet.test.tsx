import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { MapWaypoint } from "@/utils/mapGeometry";
import MapBottomSheet from "@/components/map/MapBottomSheet";

function makeWaypoint(overrides: Partial<MapWaypoint> = {}): MapWaypoint {
    return {
        dayNumber: 1,
        activityIndex: 0,
        position: [40, -3],
        activity: {
            activity: "Visita",
            details: "Detalles",
            location: {
                name: "Lugar",
                address: "Direccion",
                coordinates: { latitude: 40, longitude: -3 },
            },
            time: "10:00",
            duration: "1h",
        },
        ...overrides,
    };
}

describe("MapBottomSheet", () => {
    it("renders filters and calls onDayChange", () => {
        const onDayChange = vi.fn();

        render(
            <MapBottomSheet
                waypoints={[makeWaypoint()]}
                dayNumbers={[1, 2]}
                selectedDay={null}
                onDayChange={onDayChange}
                selectedWaypointIndex={null}
                onSelectWaypoint={vi.fn()}
                invalidCount={0}
                itineraryTitle="Itinerario"
                isCollapsed={false}
                onToggleCollapse={vi.fn()}
            />
        );

        fireEvent.click(screen.getByRole("tab", { name: "Filtrar día 2" }));
        expect(onDayChange).toHaveBeenCalledWith(2);
    });

    it("shows warning when invalidCount is positive", () => {
        render(
            <MapBottomSheet
                waypoints={[makeWaypoint()]}
                dayNumbers={[1]}
                selectedDay={null}
                onDayChange={vi.fn()}
                selectedWaypointIndex={null}
                onSelectWaypoint={vi.fn()}
                invalidCount={2}
                itineraryTitle="Itinerario"
                isCollapsed={false}
                onToggleCollapse={vi.fn()}
            />
        );

        expect(screen.getByText("2 ubicaciones sin coordenadas")).toBeInTheDocument();
    });

    it("calls onToggleCollapse when toggle button is clicked", () => {
        const onToggleCollapse = vi.fn();

        render(
            <MapBottomSheet
                waypoints={[makeWaypoint()]}
                dayNumbers={[1]}
                selectedDay={null}
                onDayChange={vi.fn()}
                selectedWaypointIndex={null}
                onSelectWaypoint={vi.fn()}
                invalidCount={0}
                itineraryTitle="Itinerario"
                isCollapsed={false}
                onToggleCollapse={onToggleCollapse}
            />
        );

        fireEvent.click(screen.getByRole("button", { name: "Contraer panel" }));
        expect(onToggleCollapse).toHaveBeenCalledTimes(1);
    });

    it("renders empty state when there are no waypoints", () => {
        render(
            <MapBottomSheet
                waypoints={[]}
                dayNumbers={[1]}
                selectedDay={null}
                onDayChange={vi.fn()}
                selectedWaypointIndex={null}
                onSelectWaypoint={vi.fn()}
                invalidCount={0}
                itineraryTitle="Itinerario"
                isCollapsed={false}
                onToggleCollapse={vi.fn()}
            />
        );

        expect(screen.getByText("Sin ubicaciones")).toBeInTheDocument();
    });

    it("calls onSelectWaypoint when clicking a card", () => {
        const onSelectWaypoint = vi.fn();

        render(
            <MapBottomSheet
                waypoints={[makeWaypoint()]}
                dayNumbers={[1]}
                selectedDay={null}
                onDayChange={vi.fn()}
                selectedWaypointIndex={null}
                onSelectWaypoint={onSelectWaypoint}
                invalidCount={0}
                itineraryTitle="Itinerario"
                isCollapsed={false}
                onToggleCollapse={vi.fn()}
            />
        );

        fireEvent.click(screen.getByRole("button", { name: /Visita - Lugar/ }));
        expect(onSelectWaypoint).toHaveBeenCalledWith(0);
    });
});
