import ItinerariesPreview from "@/components/dashboard/itineraries/ItinerariesPreview";

import { render, screen, fireEvent } from "@tests/utils/testUtils";
import { describe, it, expect, vi, beforeEach } from "vitest";

import type { ItineraryStatus } from "@/types/itinerary";

// Secondary dependency mocks
vi.mock("@components/shared/Badge", () => ({
    default: ({
        children,
        title,
    }: {
        children?: React.ReactNode;
        title?: string;
    }) => <span data-testid="badge">{children || title}</span>,
}));

vi.mock("@components/shared/Button", () => ({
    default: ({
        label,
        onClick,
        disabled,
        to,
    }: {
        label: string;
        onClick?: () => void;
        disabled?: boolean;
        to?: string;
    }) => (
        <button onClick={onClick} disabled={disabled} data-to={to}>
            {label}
        </button>
    ),
}));

vi.mock("@components/shared/Loader", () => ({
    default: () => <div data-testid="loader">Loading...</div>,
}));

// Mock ItineraryCard to avoid testing its internal details here
vi.mock("./itineraries/ItineraryCard", () => ({
    default: ({ itinerary }: any) => (
        <div data-testid="itinerary-card">
            {itinerary.title}
        </div>
    ),
}));

const mockItineraries = [
    {
        id: 1,
        icon: "🗾",
        title: "Japan Trip",
        place: "Tokyo",
        people: 2,
        budget: 3000,
        date: "2024-06-15",
        status: "ONGOING" as ItineraryStatus,
        countDays: 7,
        tags: ["culture", "gastronomy"],
        coverImage: {
            altDescription: "Tokyo cityscape",
            imageUrl: "https://example.com/tokyo.jpg",
            authorUsername: "photographer1"
        },
        permissions: { view: true, edit: true, delete: true }
    },
    {
        id: 2,
        icon: "🏔️",
        title: "Adventure in Peru",
        place: "Cusco",
        people: 4,
        budget: 2000,
        date: "2024-08-20",
        status: "PLANNED" as ItineraryStatus,
        countDays: 10,
        tags: ["adventure", "nature"],
        coverImage: {
            altDescription: "Cusco mountains",
            imageUrl: "https://example.com/cusco.jpg",
            authorUsername: "photographer2"
        },
        permissions: { view: true, edit: true, delete: true }
    },
];

describe("ItinerariesPreview Component", () => {
    let mockLoadMore: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        mockLoadMore = vi.fn();
        vi.clearAllMocks();
    });

    it("renders loading state initially", () => {
        render(
            <ItinerariesPreview
                itineraries={[]}
                loadMore={mockLoadMore}
                isLoading={true}
                isLoadingMore={false}
                isLastPage={false}
            />
        );

        expect(screen.getByTestId("loader")).toBeInTheDocument();
    });

    it("renders itineraries after loading", () => {
        render(
            <ItinerariesPreview
                itineraries={mockItineraries}
                loadMore={mockLoadMore}
                isLoading={false}
                isLoadingMore={false}
                isLastPage={true}
            />
        );

        expect(screen.getByText("Japan Trip")).toBeInTheDocument();
        expect(screen.getByText("Adventure in Peru")).toBeInTheDocument();
    });

    it("renders as section element", () => {
        const { container } = render(
            <ItinerariesPreview
                itineraries={mockItineraries}
                loadMore={mockLoadMore}
                isLoading={false}
                isLoadingMore={false}
                isLastPage={true}
            />
        );

        const section = container.querySelector("section");
        expect(section).toBeInTheDocument();
    });

    it("renders load more button when not last page", () => {
        render(
            <ItinerariesPreview
                itineraries={mockItineraries}
                loadMore={mockLoadMore}
                isLoading={false}
                isLoadingMore={false}
                isLastPage={false}
            />
        );

        expect(screen.getByText("Cargar más")).toBeInTheDocument();
    });

    it("does not render load more button on last page", () => {
        render(
            <ItinerariesPreview
                itineraries={mockItineraries}
                loadMore={mockLoadMore}
                isLoading={false}
                isLoadingMore={false}
                isLastPage={true}
            />
        );

        expect(screen.queryByText("Cargar más")).not.toBeInTheDocument();
    });

    it("calls loadMore when button is clicked", () => {
        render(
            <ItinerariesPreview
                itineraries={mockItineraries}
                loadMore={mockLoadMore}
                isLoading={false}
                isLoadingMore={false}
                isLastPage={false}
            />
        );

        const button = screen.getByText("Cargar más");
        fireEvent.click(button);

        expect(mockLoadMore).toHaveBeenCalledTimes(1);
    });

    it("shows loading text when loading more", () => {
        render(
            <ItinerariesPreview
                itineraries={mockItineraries}
                loadMore={mockLoadMore}
                isLoading={false}
                isLoadingMore={true}
                isLastPage={false}
            />
        );

        expect(screen.getByText("Cargando...")).toBeInTheDocument();
    });

    it("disables load more button when loading", () => {
        render(
            <ItinerariesPreview
                itineraries={mockItineraries}
                loadMore={mockLoadMore}
                isLoading={false}
                isLoadingMore={true}
                isLastPage={false}
            />
        );

        const button = screen.getByText("Cargando...");
        expect(button).toBeDisabled();
    });

    it("renders empty state when no itineraries", () => {
        render(
            <ItinerariesPreview
                itineraries={[]}
                loadMore={mockLoadMore}
                isLoading={false}
                isLoadingMore={false}
                isLastPage={true}
            />
        );

        expect(
            screen.getByText("No tienes itinerarios todavía.")
        ).toBeInTheDocument();
        expect(screen.getByText("Crear itinerario")).toBeInTheDocument();
    });
});
