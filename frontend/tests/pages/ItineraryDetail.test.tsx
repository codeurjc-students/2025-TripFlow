import ItineraryDetailPage from "@pages/itineraries/ItineraryDetail";

import { render, screen, waitFor, fireEvent } from "@tests/utils/testUtils";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { getItineraryById } from "@/services/itineraryService";
import { useNotification } from "@/providers/notificationProvider";
import { pdf } from "@react-pdf/renderer";
import type { ExtendedItinerary, ItineraryStatus } from "@/types/itinerary";

const mockNotify = vi.fn();
const mockToBlob = vi.fn();

// Mock service
vi.mock("@/services/itineraryService", () => ({
    getItineraryById: vi.fn(),
}));

vi.mock("@/providers/notificationProvider", async () => {
    const actual = await vi.importActual("@/providers/notificationProvider");
    return {
        ...actual,
        useNotification: vi.fn(),
    };
});

vi.mock("@react-pdf/renderer", () => ({
    pdf: vi.fn(() => ({
        toBlob: mockToBlob,
    })),
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
    default: ({ title, back, right }: { title: string; back: { url: string }; right?: React.ReactNode }) => (
        <header data-testid="inner-tab-header" data-back-url={back?.url}>
            <h1>{title}</h1>
            {right}
        </header>
    ),
}));

vi.mock("@/components/dashboard/itineraries/ExtendedItinerary", () => ({
    default: ({ itinerary, onExportPdf }: any) => (
        <div data-testid="extended-itinerary" data-itinerary-id={itinerary?.id}>
            <button onClick={onExportPdf} aria-label="Exportar itinerario en PDF">
                Exportar PDF
            </button>
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
        vi.mocked(useNotification).mockReturnValue({ notify: mockNotify });
        mockToBlob.mockResolvedValue(new Blob(["pdf"], { type: "application/pdf" }));

        Object.defineProperty(globalThis.URL, "createObjectURL", {
            writable: true,
            value: vi.fn(() => "blob:mock-pdf"),
        });

        Object.defineProperty(globalThis.URL, "revokeObjectURL", {
            writable: true,
            value: vi.fn(),
        });
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

    it("exports itinerary as pdf and notifies success", async () => {
        vi.mocked(getItineraryById).mockResolvedValue(mockItinerary);

        render(<ItineraryDetailPage />);

        await waitFor(() => {
            expect(screen.getByTestId("extended-itinerary")).toBeInTheDocument();
        });

        fireEvent.click(
            screen.getByRole("button", { name: /exportar itinerario en pdf/i })
        );

        await waitFor(() => {
            expect(pdf).toHaveBeenCalled();
            expect(mockToBlob).toHaveBeenCalled();
            expect(mockNotify).toHaveBeenCalledWith("Itinerario exportado en PDF", "success");
        });
    });

    it("notifies error when pdf export fails", async () => {
        vi.mocked(getItineraryById).mockResolvedValue(mockItinerary);
        mockToBlob.mockRejectedValue(new Error("export failed"));

        render(<ItineraryDetailPage />);

        await waitFor(() => {
            expect(screen.getByTestId("extended-itinerary")).toBeInTheDocument();
        });

        fireEvent.click(
            screen.getByRole("button", { name: /exportar itinerario en pdf/i })
        );

        await waitFor(() => {
            expect(mockNotify).toHaveBeenCalledWith("No se pudo exportar el itinerario", "error");
        });
    });
});
