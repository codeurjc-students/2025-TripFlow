import ItineraryEditForm from "@components/form/ItineraryEditForm";

import { render, screen, fireEvent } from "@tests/utils/testUtils";
import { describe, it, expect, vi, beforeEach } from "vitest";

import type { ExtendedItinerary } from "@/types/itinerary";

// Secondary dependencies mocks
vi.mock("@components/dashboard/itineraries/BasicInfoSection", () => ({
    default: ({ itinerary, onUpdateBasicInfo, onTagsChange }: any) => (
        <div data-testid="basic-info-section">
            <span>Basic Info: {itinerary.title}</span>
            <button onClick={() => onUpdateBasicInfo("title", "Updated Title")}>
                Update Basic Info
            </button>
            <button onClick={() => onTagsChange(["nueva"])}>Update Tags</button>
        </div>
    ),
}));

vi.mock("@components/dashboard/itineraries/ItinerarySection", () => ({
    default: ({ days, onDaysChange, onAddNewDay, onRemoveDay }: any) => (
        <div data-testid="itinerary-section">
            <span>Days: {days.length}</span>
            <button
                onClick={() =>
                    onDaysChange([...days, { day: days.length + 1 }])
                }>
                Update Days
            </button>
            <button onClick={onAddNewDay}>Add Day</button>
            <button onClick={() => onRemoveDay(0)}>Remove Day</button>
        </div>
    ),
}));

vi.mock("@/components/shared/Button", () => ({
    default: ({ onClick, style, label, children }: any) => (
        <button
            data-testid="button"
            onClick={onClick}
            data-style={style?.join(",")}>
            {label}
            {children}
        </button>
    ),
}));

vi.mock("lucide-react", () => ({
    Trash2: () => <svg data-testid="trash-icon" />,
    Plane: () => <svg data-testid="plane-icon" />,
    Euro: () => <svg data-testid="euro-icon" />,
    BatteryMedium: () => <svg data-testid="battery-medium-icon" />,
    Calendar: () => <svg data-testid="calendar-icon" />,
    CalendarDays: () => <svg data-testid="calendar-days-icon" />,
    MapPin: () => <svg data-testid="map-pin-icon" />,
    PiggyBank: () => <svg data-testid="piggy-bank-icon" />,
    Users: () => <svg data-testid="users-icon" />,
    Tag: () => <svg data-testid="tag-icon" />,
    Plus: () => <svg data-testid="plus-icon" />,
    X: () => <svg data-testid="x-icon" />,
}));

const mockItinerary: ExtendedItinerary = {
    id: 1,
    title: "Viaje a París",
    place: "París, Francia",
    people: 2,
    budget: 2000,
    date: "2024-06-01",
    status: "DRAFT",
    countDays: 3,
    tags: ["romántica", "cultural"],
    days: [
        {
            day: 1,
            activities: [],
        },
        {
            day: 2,
            activities: [],
        },
        {
            day: 3,
            activities: [],
        },
    ],
    coverImage: {
        altDescription: "Vista de la Torre Eiffel",
        imageUrl: "https://example.com/torre-eiffel.jpg",
        authorUsername: "usuario_ejemplo"
    },
    permissions: { view: true, edit: true, delete: true }
};

const mockEmptyItinerary: ExtendedItinerary = {
    id: 2,
    title: "",
    place: "",
    people: 0,
    budget: 0,
    date: "",
    status: "DRAFT",
    countDays: 0,
    tags: [],
    days: [],
    coverImage: {
        altDescription: "",
        imageUrl: "",
        authorUsername: "",
    },
    permissions: { view: true, edit: true, delete: true }
};

describe("ItineraryEditForm Component", () => {
    const mockHandlers = {
        onUpdateBasicInfo: vi.fn(),
        onTagsChange: vi.fn(),
        onDaysChange: vi.fn(),
        onAddNewDay: vi.fn(),
        onRemoveDay: vi.fn(),
        onDelete: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders itinerary edit form", () => {
        const { container } = render(
            <ItineraryEditForm itinerary={mockItinerary} {...mockHandlers} />
        );

        expect(container.firstChild).toBeInTheDocument();
    });

    it("renders BasicInfoSection component", () => {
        render(<ItineraryEditForm itinerary={mockItinerary} {...mockHandlers} />);

        expect(screen.getByTestId("basic-info-section")).toBeInTheDocument();
    });

    it("renders ItinerarySection component", () => {
        render(<ItineraryEditForm itinerary={mockItinerary} {...mockHandlers} />);

        expect(screen.getByTestId("itinerary-section")).toBeInTheDocument();
    });

    it("renders delete button when onDelete is provided", () => {
        render(<ItineraryEditForm itinerary={mockItinerary} {...mockHandlers} />);

        const deleteButton = screen.getByText("Eliminar Itinerario");
        expect(deleteButton).toBeInTheDocument();
    });

    it("does not render delete button when onDelete is not provided", () => {
        const { onDelete, ...handlersWithoutDelete } = mockHandlers;
        render(<ItineraryEditForm itinerary={mockItinerary} {...handlersWithoutDelete} />);

        const deleteButton = screen.queryByText("Eliminar Itinerario");
        expect(deleteButton).not.toBeInTheDocument();
    });

    it("calls onDelete when delete button is clicked", () => {
        render(<ItineraryEditForm itinerary={mockItinerary} {...mockHandlers} />);

        const deleteButton = screen.getByText("Eliminar Itinerario");
        fireEvent.click(deleteButton);

        expect(mockHandlers.onDelete).toHaveBeenCalledTimes(1);
    });

    it("renders with empty itinerary", () => {
        render(<ItineraryEditForm itinerary={mockEmptyItinerary} {...mockHandlers} />);

        expect(screen.getByTestId("basic-info-section")).toBeInTheDocument();
    });

    it("renders edit form container", () => {
        const { container } = render(
            <ItineraryEditForm itinerary={mockItinerary} {...mockHandlers} />
        );

        const editForm = container.querySelector('[class*="editForm"]');
        expect(editForm).toBeInTheDocument();
    });

    it("passes correct props to BasicInfoSection", () => {
        render(<ItineraryEditForm itinerary={mockItinerary} {...mockHandlers} />);

        expect(
            screen.getByText(/Basic Info: Viaje a París/)
        ).toBeInTheDocument();
    });

    it("passes correct props to ItinerarySection", () => {
        render(<ItineraryEditForm itinerary={mockItinerary} {...mockHandlers} />);

        expect(screen.getByText(/Days: 3/)).toBeInTheDocument();
    });
});
