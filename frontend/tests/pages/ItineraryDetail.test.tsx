import ItineraryDetailPage from "@pages/itineraries/ItineraryDetail";

import { render, screen, waitFor } from "@tests/utils/testUtils";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { getItineraryById } from "@/services/itineraryService";
import type { ExtendedItinerary, ItineraryStatus } from "@/types/itinerary";

// Mock service
vi.mock("@/services/itineraryService", () => ({
    getItineraryById: vi.fn(),
}));

// Mock React Router
vi.mock("react-router", async () => {
    const actual = await vi.importActual("react-router");
    return {
        ...actual,
        useParams: vi.fn(() => ({ id: "1" })),
        Navigate: ({ to }: { to: string }) => (
            <div data-testid="navigate" data-to={to} />
        ),
    };
});

// Secondary dependencies mocks
vi.mock("@/layouts/AppLayout", () => ({
    default: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="app-layout">{children}</div>
    ),
}));

vi.mock("@/components/dashboard/headers/InnerTabHeader", () => ({
    default: ({ title, back }: { title: string; back: { url: string } }) => (
        <header data-testid="inner-tab-header" data-back-url={back?.url}>
            <h1>{title}</h1>
        </header>
    ),
}));

vi.mock("@/components/dashboard/itineraries/ExtendedItinerary", () => ({
    default: ({ itinerary }: any) => (
        <div data-testid="extended-itinerary" data-itinerary-id={itinerary?.id}>
        </div>
    ),
}));

vi.mock("@components/shared/Loader", () => ({
    default: ({ size, variant }: { size?: number; variant?: string }) => (
        <div data-testid="loader" data-size={size} data-variant={variant}>
            Loading...
        </div>
    ),
}));

const mockItinerary: ExtendedItinerary = {
    id: 1,
    title: "Japan Trip",
    place: "Tokyo",
    people: 2,
    budget: 3000,
    date: "2024-06-15",
    status: "ONGOING" as ItineraryStatus,
    countDays: 7,
    tags: ["culture", "gastronomy"],
    days: [],
    coverImage: {
        altDescription: "A beautiful view of Mount Fuji",
        imageUrl: "https://example.com/mount-fuji.jpg",
        authorUsername: "photographer123",
    },
    permissions: { view: true, edit: true, delete: true }
};

describe("ItineraryDetail Page", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders itinerary detail page", async () => {
        vi.mocked(getItineraryById).mockResolvedValue(mockItinerary);

        render(<ItineraryDetailPage />);

        await waitFor(() => {
            expect(screen.getByTestId("app-layout")).toBeInTheDocument();
        });
    });

    it("renders loading state initially", () => {
        vi.mocked(getItineraryById).mockImplementation(
            () => new Promise(() => {})
        );

        render(<ItineraryDetailPage />);

        expect(screen.getByTestId("loader")).toBeInTheDocument();
    });

    it("renders inner tab header", async () => {
        vi.mocked(getItineraryById).mockResolvedValue(mockItinerary);

        render(<ItineraryDetailPage />);

        await waitFor(() => {
            expect(screen.getByTestId("inner-tab-header")).toBeInTheDocument();
        });
    });

    it("renders header with itinerary title", async () => {
        vi.mocked(getItineraryById).mockResolvedValue(mockItinerary);

        render(<ItineraryDetailPage />);

        expect(await screen.findByText("Japan Trip")).toBeInTheDocument();
    });

    it("header has correct back url", async () => {
        vi.mocked(getItineraryById).mockResolvedValue(mockItinerary);

        render(<ItineraryDetailPage />);

        await waitFor(() => {
            const header = screen.getByTestId("inner-tab-header");
            expect(header.getAttribute("data-back-url")).toBe("/itineraries");
        });
    });

    it("renders extended itinerary component", async () => {
        vi.mocked(getItineraryById).mockResolvedValue(mockItinerary);

        render(<ItineraryDetailPage />);

        await waitFor(() => {
            expect(
                screen.getByTestId("extended-itinerary")
            ).toBeInTheDocument();
        });
    });

    it("passes itinerary data to ExtendedItinerary", async () => {
        vi.mocked(getItineraryById).mockResolvedValue(mockItinerary);

        render(<ItineraryDetailPage />);

        await waitFor(() => {
            expect(screen.queryByTestId("loader")).not.toBeInTheDocument();
        });

        // The mock renders title
        expect(screen.getByText("Japan Trip")).toBeInTheDocument();
    });

    it("wraps content in AppLayout", async () => {
        vi.mocked(getItineraryById).mockResolvedValue(mockItinerary);

        const { container } = render(<ItineraryDetailPage />);

        await waitFor(() => {
            const appLayout = container.querySelector(
                '[data-testid="app-layout"]'
            );
            expect(appLayout).toBeInTheDocument();
        });
    });

    it("renders both main components", async () => {
        vi.mocked(getItineraryById).mockResolvedValue(mockItinerary);

        render(<ItineraryDetailPage />);

        await waitFor(() => {
            expect(screen.queryByTestId("loader")).not.toBeInTheDocument();
        });

        expect(screen.getByTestId("inner-tab-header")).toBeInTheDocument();
        expect(screen.getByTestId("extended-itinerary")).toBeInTheDocument();
    });
});
