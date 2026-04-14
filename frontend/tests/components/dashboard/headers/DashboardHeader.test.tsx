import DashboardHeader from "@components/dashboard/headers/DashboardHeader";

import { render, screen } from "@tests/utils/testUtils";
import { describe, it, expect } from "vitest";

describe("DashboardHeader Component", () => {
    it("renders welcome title without name", () => {
        render(<DashboardHeader />);
        expect(screen.getByText("Bienvenido,")).toBeInTheDocument();
    });

    it("renders welcome title, with name", () => {
        render(<DashboardHeader name="John" />);
        expect(screen.getByText("Bienvenido,")).toBeInTheDocument();
        expect(screen.getByText("John")).toBeInTheDocument();
    });

    it("renders notifications button", () => {
        render(<DashboardHeader />);
        const button = screen.getByRole("link", { name: "Notificaciones" });
        expect(button).toBeInTheDocument();
        expect(button).toHaveAttribute("href", "/dashboard/notifications");
    });
});
