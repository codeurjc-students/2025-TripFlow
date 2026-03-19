import styles from "@styles/components/map/MapBottomSheet.module.css";

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
            />
        );

        expect(screen.getByText("2 ubicaciones sin coordenadas")).toBeInTheDocument();
    });

    it("toggles collapsed state", () => {
        const { container } = render(
            <MapBottomSheet
                waypoints={[makeWaypoint()]}
                dayNumbers={[1]}
                selectedDay={null}
                onDayChange={vi.fn()}
                selectedWaypointIndex={null}
                onSelectWaypoint={vi.fn()}
                invalidCount={0}
                itineraryTitle="Itinerario"
            />
        );

        const sheet = container.querySelector(`.${styles.bottomSheet}`) as HTMLElement;
        expect(sheet.className).not.toContain(styles.collapsed);

        fireEvent.click(screen.getByRole("button", { name: "Contraer panel" }));
        expect(sheet.className).toContain(styles.collapsed);
        expect(screen.getByRole("button", { name: "Expandir panel" })).toBeInTheDocument();
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
            />
        );

        fireEvent.click(screen.getByRole("button", { name: /Visita - Lugar/ }));
        expect(onSelectWaypoint).toHaveBeenCalledWith(0);
    });
});
