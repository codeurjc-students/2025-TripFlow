import Sidebar from "@components/shared/Sidebar";

import { render, screen } from "@tests/utils/testUtils";
import { describe, it, expect, vi } from "vitest";

// Mock Logo component
vi.mock("@components/shared/Logo", () => ({
    default: () => <div data-testid="mock-logo">Logo</div>
}));

describe("Sidebar Component", () => {
    it("renders logo", () => {
        render(<Sidebar />);
        expect(screen.getByTestId("mock-logo")).toBeInTheDocument();
    });

    it("renders navigation links", () => {
        render(<Sidebar />);
        expect(screen.getByRole("link", { name: /dashboard/i })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: /itinerarios/i })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: /explorar/i })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: /perfil/i })).toBeInTheDocument();
    });

    it("activates current route", () => {
        window.history.pushState({}, "Test Page", "/dashboard");

        render(<Sidebar />);

        const dashboardLink = screen.getByRole("link", { name: /dashboard/i });
        expect(dashboardLink).toHaveAttribute("href", "/dashboard");
    });
});
