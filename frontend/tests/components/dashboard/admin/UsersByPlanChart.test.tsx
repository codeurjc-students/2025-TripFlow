import UsersByPlanChart from "@/components/dashboard/admin/UsersByPlanChart";

import { render, screen, waitFor } from "@tests/utils/testUtils";
import { describe, it, expect, vi, beforeEach } from "vitest";

import * as statsService from "@/services/statsService";

vi.mock("@/services/statsService");

describe("UsersByPlanChart", () => {
    beforeEach(() => {
        vi.mocked(statsService.getUsersByPlanStats).mockResolvedValue({
            items: [
                { plan: "FREE", count: 10 },
                { plan: "PRO", count: 4 },
                { plan: "PREMIUM", count: 2 },
            ],
        });
    });

    it("renders users by plan title", async () => {
        render(<UsersByPlanChart />);

        await waitFor(() => {
            expect(screen.getByText("Usuarios por plan")).toBeInTheDocument();
        });
    });

    it("renders normalized plan labels and counts", async () => {
        render(<UsersByPlanChart />);

        await waitFor(() => {
            expect(screen.getByText("Free")).toBeInTheDocument();
            expect(screen.getByText("Pro")).toBeInTheDocument();
            expect(screen.getByText("Premium")).toBeInTheDocument();
            expect(screen.getByText("10")).toBeInTheDocument();
        });
    });

    it("keeps zero-width bars for empty plans", async () => {
        vi.mocked(statsService.getUsersByPlanStats).mockResolvedValue({
            items: [
                { plan: "FREE", count: 8 },
                { plan: "PRO", count: 0 },
                { plan: "PREMIUM", count: 0 },
            ],
        });

        const { container } = render(<UsersByPlanChart />);

        await waitFor(() => {
            const fills = container.querySelectorAll("div[class*='planFill']");
            expect(fills).toHaveLength(3);
            expect((fills[1] as HTMLDivElement).style.width).toBe("0%");
            expect((fills[2] as HTMLDivElement).style.width).toBe("0%");
        });
    });
});
