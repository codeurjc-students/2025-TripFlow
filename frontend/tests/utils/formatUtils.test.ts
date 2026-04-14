import { describe, expect, it } from "vitest";

import { formatDate, getDate } from "@/utils/formatUtils";

describe("formatUtils date guards", () => {
    it("returns fallback label for invalid dates", () => {
        expect(formatDate("La fecha de inicio del viaje")).toBe("Fecha por definir");
        expect(formatDate("")).toBe("Fecha por definir");
    });

    it("does not throw when calculating offset on invalid initial date", () => {
        expect(() => getDate("invalid", 2)).not.toThrow();
        const value = getDate("invalid", 2);
        expect(value).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
});
