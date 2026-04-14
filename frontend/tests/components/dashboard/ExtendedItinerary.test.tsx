import ExtendedItinerary from "@/components/dashboard/itineraries/ExtendedItinerary";

import { render, screen, fireEvent } from "@tests/utils/testUtils";
import { describe, it, expect, vi } from "vitest";
import type { ExtendedItinerary as ExtendedItineraryType } from "@/types/itinerary";

// Secondary dependencies mocks
vi.mock("@components/shared/Badge", () => ({
    default: ({ status, style, title }: any) => (
        <span data-testid="badge" data-status={status} data-style={style}>
            {status || title}
        </span>
    ),
}));

const mockItinerary: ExtendedItineraryType = {
    id: 1,
    title: "Aventura en Tokio",
    place: "Tokio, Japón",
    status: "PLANNED",
    people: 3,
    budget: 1500,
    countDays: 2,
    date: "2025-07-15",
    tags: ["Cultura", "Gastronomía", "Tecnología"],
    days: [
        {
            day: 1,
            activities: [
                {
                    time: "09:00",
                    duration: "2h",
                    activity: "Visita al Templo Senso-ji",
                    details: "Explora el templo más antiguo de Tokio",
                    location: {
                        name: "Templo Senso-ji",
                        address: "2 Chome-3-1 Asakusa, Taito City, Tokyo",
                        coordinates: {
                            latitude: 35.7148,
                            longitude: 139.7967
                        }
                    },
                },
                {
                    time: "14:00",
                    duration: "3h",
                    activity: "Tour por Shibuya",
                    details: "Conoce el famoso cruce de Shibuya",
                    location: {
                        name: "Shibuya Crossing",
                        address: "Shibuya City, Tokyo",
                        coordinates: {
                            latitude: 35.6595,
                            longitude: 139.7005
                        },
                    },
                },
            ],
        },
        {
            day: 2,
            activities: [
                {
                    time: "10:00",
                    duration: "4h",
                    activity: "Visita al Monte Fuji",
                    details: "Excursión de día completo",
                    location: {
                        name: "Monte Fuji",
                        address: "Fujinomiya, Shizuoka",
                        coordinates: {
                            latitude: 35.3606,
                            longitude: 138.7274
                        }
                    },
                },
            ],
        },
    ],
    coverImage: {
        altDescription: "Vista del Monte Fuji",
        imageUrl: "https://example.com/monte-fuji.jpg",
        authorUsername: "fotografo123",
    },
    permissions: { view: true, edit: true, delete: true }
};

describe("ExtendedItinerary Component", () => {
    it("renders extended itinerary component", () => {
        const { container } = render(
            <ExtendedItinerary itinerary={mockItinerary} />
        );

        expect(container.firstChild).toBeInTheDocument();
    });

    it("renders as section element", () => {
        const { container } = render(
            <ExtendedItinerary itinerary={mockItinerary} />
        );

        const section = container.querySelector("section");
        expect(section).toBeInTheDocument();
    });

    it("renders destination info", () => {
        render(<ExtendedItinerary itinerary={mockItinerary} />);

        expect(screen.getByText("Tokio, Japón")).toBeInTheDocument();
    });

    it("renders people count", () => {
        render(<ExtendedItinerary itinerary={mockItinerary} />);

        expect(screen.getByText(/3 personas/i)).toBeInTheDocument();
    });

    it("renders budget with currency", () => {
        render(<ExtendedItinerary itinerary={mockItinerary} />);

        expect(screen.getByText("1.500, 00 €")).toBeInTheDocument();
    });

    it("renders formatted date", () => {
        render(<ExtendedItinerary itinerary={mockItinerary} />);

        expect(screen.getAllByText(/jul/i).length).toBeGreaterThan(0);
    });

    it("renders all tags", () => {
        render(<ExtendedItinerary itinerary={mockItinerary} />);

        expect(screen.getByText(/cultura/i)).toBeInTheDocument();
        expect(screen.getByText(/gastronomía/i)).toBeInTheDocument();
        expect(screen.getByText(/tecnología/i)).toBeInTheDocument();
    });

    it("renders all day cards", () => {
        render(<ExtendedItinerary itinerary={mockItinerary} />);

        expect(screen.getByText(/día 1/i)).toBeInTheDocument();
        expect(screen.getByText(/día 2/i)).toBeInTheDocument();
    });

    it("renders activity time", () => {
        render(<ExtendedItinerary itinerary={mockItinerary} />);

        expect(screen.getByText("09:00")).toBeInTheDocument();
        expect(screen.getByText("14:00")).toBeInTheDocument();
    });

    it("renders activity duration", () => {
        render(<ExtendedItinerary itinerary={mockItinerary} />);

        expect(screen.getByText(/2h/)).toBeInTheDocument();
        expect(screen.getByText(/3h/)).toBeInTheDocument();
    });

    it("renders activity titles", () => {
        render(<ExtendedItinerary itinerary={mockItinerary} />);

        expect(
            screen.getByText("Visita al Templo Senso-ji")
        ).toBeInTheDocument();
        expect(screen.getByText("Tour por Shibuya")).toBeInTheDocument();
    });

    it("renders activity details", () => {
        render(<ExtendedItinerary itinerary={mockItinerary} />);

        expect(
            screen.getByText("Explora el templo más antiguo de Tokio")
        ).toBeInTheDocument();
    });

    it("renders activity location name", () => {
        render(<ExtendedItinerary itinerary={mockItinerary} />);

        expect(screen.getByText(/Templo Senso-ji -/)).toBeInTheDocument();
    });

    it("renders activity location address", () => {
        render(<ExtendedItinerary itinerary={mockItinerary} />);

        expect(
            screen.getByText(/2 Chome-3-1 Asakusa, Taito City, Tokyo/)
        ).toBeInTheDocument();
    });

    it("handles itinerary with no tags", () => {
        const itineraryNoTags = { ...mockItinerary, tags: [] };
        const { container } = render(
            <ExtendedItinerary itinerary={itineraryNoTags} />
        );

        const tagsSection = container.querySelector('[class*="tags"]');
        expect(tagsSection).toBeInTheDocument();
    });

    it("handles itinerary with no activities", () => {
        const itineraryNoActivities = {
            ...mockItinerary,
            days: [{ day: 1, activities: [] }],
        };

        render(<ExtendedItinerary itinerary={itineraryNoActivities} />);

        expect(screen.getByText(/Día 1/)).toBeInTheDocument();
    });

    it("renders and triggers pdf export action", () => {
        const onExportPdf = vi.fn();

        render(
            <ExtendedItinerary
                itinerary={mockItinerary}
                onExportPdf={onExportPdf}
            />
        );

        fireEvent.click(
            screen.getByRole("button", { name: /exportar itinerario en pdf/i })
        );

        expect(onExportPdf).toHaveBeenCalledTimes(1);
    });
});
