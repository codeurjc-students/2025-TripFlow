import BasicInfoSection from "@/components/dashboard/itineraries/BasicInfoSection";

import { render, screen, fireEvent } from "@tests/utils/testUtils";
import { describe, it, expect, vi } from "vitest";

import type { ExtendedItinerary } from "@/types/itinerary";

// Secondary dependencies mocks
vi.mock("@/hooks/useBasicInfoFormFields", () => ({
    useBasicInfoFormFields: (itinerary: ExtendedItinerary) => ({
        basicInfoFields: [
            {
                name: "title",
                label: "Título del viaje",
                type: "text",
                value: itinerary.title,
                placeholder: "Ej: Escapada a París",
                required: true,
            },
            {
                name: "destination",
                label: "Destino",
                type: "text",
                value: itinerary.place,
                placeholder: "Ej: París, Francia",
                required: true,
            },
        ],
        getFieldHandler: () => vi.fn(),
    }),
}));

vi.mock("@components/dashboard/TagsSection", () => ({
    default: ({ tags, onTagsChange }: any) => (
        <div data-testid="tags-section">
            <span>Tags: {tags.join(", ")}</span>
            <button onClick={() => onTagsChange([...tags, "nueva"])}>
                Add Tag
            </button>
        </div>
    ),
}));

vi.mock("@components/form/FormGroup", () => ({
    default: ({ field, handleChange, fullWidth }: any) => (
        <div data-testid="form-group" data-fullwidth={fullWidth}>
            <label htmlFor={field.name}>{field.label}</label>
            <input
                id={field.name}
                type={field.type}
                name={field.name}
                value={field.value}
                placeholder={field.placeholder}
                onChange={handleChange}
            />
        </div>
    ),
}));

const mockItinerary: ExtendedItinerary = {
    id: 1,
    title: "Viaje a París",
    place: "París, Francia",
    people: 2,
    budget: 2000,
    date: "2024-06-01",
    status: "DRAFT",
    countDays: 7,
    tags: ["romántica", "cultural"],
    days: [],
    coverImage: {
        altDescription: "Una hermosa vista de la Torre Eiffel",
        imageUrl: "https://example.com/eiffel-tower.jpg",
        authorUsername: "photographer789",
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

describe("BasicInfoSection Component", () => {
    it("renders basic info section", () => {
        const { container } = render(
            <BasicInfoSection
                itinerary={mockItinerary}
                onUpdateBasicInfo={vi.fn()}
                onTagsChange={vi.fn()}
            />
        );

        expect(container.firstChild).toBeInTheDocument();
    });

    it("renders all form groups", () => {
        render(
            <BasicInfoSection
                itinerary={mockItinerary}
                onUpdateBasicInfo={vi.fn()}
                onTagsChange={vi.fn()}
            />
        );

        const formGroups = screen.getAllByTestId("form-group");
        expect(formGroups).toHaveLength(2);
    });

    it("renders form groups with fullWidth prop", () => {
        render(
            <BasicInfoSection
                itinerary={mockItinerary}
                onUpdateBasicInfo={vi.fn()}
                onTagsChange={vi.fn()}
            />
        );

        const formGroups = screen.getAllByTestId("form-group");
        formGroups.forEach((group) => {
            expect(group).toHaveAttribute("data-fullwidth", "true");
        });
    });

    it("renders title field", () => {
        render(
            <BasicInfoSection
                itinerary={mockItinerary}
                onUpdateBasicInfo={vi.fn()}
                onTagsChange={vi.fn()}
            />
        );

        expect(screen.getByLabelText("Título del viaje")).toBeInTheDocument();
    });

    it("renders destination field", () => {
        render(
            <BasicInfoSection
                itinerary={mockItinerary}
                onUpdateBasicInfo={vi.fn()}
                onTagsChange={vi.fn()}
            />
        );

        expect(screen.getByLabelText("Destino")).toBeInTheDocument();
    });

    it("renders TagsSection component", () => {
        render(
            <BasicInfoSection
                itinerary={mockItinerary}
                onUpdateBasicInfo={vi.fn()}
                onTagsChange={vi.fn()}
            />
        );

        expect(screen.getByTestId("tags-section")).toBeInTheDocument();
    });

    it("passes tags to TagsSection", () => {
        render(
            <BasicInfoSection
                itinerary={mockItinerary}
                onUpdateBasicInfo={vi.fn()}
                onTagsChange={vi.fn()}
            />
        );

        expect(screen.getByText(/romántica, cultural/)).toBeInTheDocument();
    });

    it("calls onTagsChange when tags are modified", () => {
        const mockOnTagsChange = vi.fn();

        render(
            <BasicInfoSection
                itinerary={mockItinerary}
                onUpdateBasicInfo={vi.fn()}
                onTagsChange={mockOnTagsChange}
            />
        );

        const addTagButton = screen.getByText("Add Tag");
        fireEvent.click(addTagButton);

        expect(mockOnTagsChange).toHaveBeenCalledTimes(1);
    });

    it("renders with empty itinerary", () => {
        render(
            <BasicInfoSection
                itinerary={mockEmptyItinerary}
                onUpdateBasicInfo={vi.fn()}
                onTagsChange={vi.fn()}
            />
        );

        expect(screen.getByTestId("tags-section")).toBeInTheDocument();
    });

    it("renders section as section element", () => {
        const { container } = render(
            <BasicInfoSection
                itinerary={mockItinerary}
                onUpdateBasicInfo={vi.fn()}
                onTagsChange={vi.fn()}
            />
        );

        const section = container.querySelector("section");
        expect(section).toBeInTheDocument();
    });

    it("renders form grid container", () => {
        const { container } = render(
            <BasicInfoSection
                itinerary={mockItinerary}
                onUpdateBasicInfo={vi.fn()}
                onTagsChange={vi.fn()}
            />
        );

        const formGrid = container.querySelector('[class*="formGrid"]');
        expect(formGrid).toBeInTheDocument();
    });

    it("renders with empty tags array", () => {
        render(
            <BasicInfoSection
                itinerary={mockEmptyItinerary}
                onUpdateBasicInfo={vi.fn()}
                onTagsChange={vi.fn()}
            />
        );

        expect(screen.queryByText(/romántica/)).not.toBeInTheDocument();
    });
});
