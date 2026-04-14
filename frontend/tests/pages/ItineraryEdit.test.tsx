import ItineraryEdit from "@/pages/itineraries/ItineraryEdit";

import { render, screen, waitFor } from "@tests/utils/testUtils";
import { describe, it, expect, vi, beforeEach } from "vitest";

import * as itineraryService from "@/services/itineraryService";
import type { ExtendedItinerary, ItineraryStatus } from "@/types/itinerary";

// Secondary dependencies mocks
vi.mock("react-router", async () => {
    const actual = await vi.importActual("react-router");
    return {
        ...actual,
        useParams: () => ({ id: "1" }),
        Navigate: ({ to }: any) => <div data-testid="navigate">{to}</div>,
    };
});

// Fix: Correct mock path to match ItineraryEditor import
vi.mock("@/components/dashboard/headers/InnerTabHeader", () => ({
    default: ({ title, back }: any) => (
        <div data-testid="inner-tab-header">
            <h1>{title}</h1>
            <a href={back?.url}>Back</a>
        </div>
    ),
}));

vi.mock("@/components/form/ItineraryEditForm", () => ({
    default: ({ itinerary, onSave: _onSave }: any) => (
        <div data-testid="itinerary-edit-form">
            <span>Itinerary Form</span>
            <span>ID: {itinerary?.id}</span>
            <span>Title: {itinerary?.title}</span>
        </div>
    ),
}));

vi.mock("@/layouts/AppLayout", () => ({
    default: ({ children }: any) => (
        <div data-testid="app-layout">{children}</div>
    ),
}));

vi.mock("@/components/shared/Loader", () => ({
    default: ({ size, variant }: any) => (
        <div data-testid="loader">
            Loading... {size} {variant}
        </div>
    ),
}));

vi.mock("@/services/itineraryService", () => ({
    getItineraryById: vi.fn(),
    updateItinerary: vi.fn(),
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

describe("ItineraryEdit Component", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(itineraryService.getItineraryById).mockResolvedValue(mockItinerary);
    });

    it("renders itinerary edit page", async () => {
        const { container } = render(<ItineraryEdit />);

        await waitFor(() => {
            expect(container.firstChild).toBeInTheDocument();
        });
    });

    it("renders AppLayout", async () => {
        render(<ItineraryEdit />);

        await waitFor(() => {
            expect(screen.getByTestId("app-layout")).toBeInTheDocument();
        });
    });

    it("renders InnerTabHeader with correct title", async () => {
        render(<ItineraryEdit />);

        await waitFor(() => {
            expect(screen.getByText("Editar Itinerario")).toBeInTheDocument();
        });
    });

    it("renders InnerTabHeader with correct back URL", async () => {
        render(<ItineraryEdit />);

        await waitFor(() => {
            const backLink = screen.getByText("Back");
            expect(backLink).toHaveAttribute("href", "/itineraries/1");
        });
    });

    it("shows loader while fetching itinerary", () => {
        render(<ItineraryEdit />);

        expect(screen.getByTestId("loader")).toBeInTheDocument();
    });

    it("renders ItineraryEditForm after loading", async () => {
        render(<ItineraryEdit />);

        await waitFor(() => {
            expect(screen.getByTestId("itinerary-edit-form")).toBeInTheDocument();
        });
    });

    it("passes fetched itinerary to ItineraryEditForm", async () => {
        render(<ItineraryEdit />);

        await waitFor(() => {
            expect(screen.getByText("ID: 1")).toBeInTheDocument();
            expect(
                screen.getByText("Title: Japan Trip")
            ).toBeInTheDocument();
        });
    });

    it("hides loader after itinerary is loaded", async () => {
        render(<ItineraryEdit />);

        await waitFor(() => {
            expect(screen.queryByTestId("loader")).not.toBeInTheDocument();
        });
    });

    it("calls getItineraryById with correct id", async () => {
        render(<ItineraryEdit />);

        await waitFor(() => {
            expect(itineraryService.getItineraryById).toHaveBeenCalledWith(1);
        });
    });

    it("renders header inside layout", async () => {
        render(<ItineraryEdit />);

        await waitFor(() => {
            const layout = screen.getByTestId("app-layout");
            const header = screen.getByTestId("inner-tab-header");
            expect(layout).toContainElement(header);
        });
    });

    it("renders form inside layout after loading", async () => {
        render(<ItineraryEdit />);

        await waitFor(() => {
            const layout = screen.getByTestId("app-layout");
            const form = screen.getByTestId("itinerary-edit-form");
            expect(layout).toContainElement(form);
        });
    });
});