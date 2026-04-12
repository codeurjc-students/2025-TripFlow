import type { ItineraryStatus } from "@/types/itinerary";
import type { CollaboratorRole } from "@/types/collaboration";

interface FormatDateOptions {
    excludeDay?: boolean;
    excludeMonth?: boolean;
    excludeYear?: boolean;
    shortMonth?: boolean;
}

const INVALID_DATE_LABEL = "Fecha por definir";

function parseDate(value: string): Date | null {
    if (!value || typeof value !== "string") {
        return null;
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        return null;
    }

    return parsed;
}

export const getDate = (initialDate: string, offset: number) => {
    const baseDate = parseDate(initialDate) || new Date();
    const date = new Date(baseDate);
    date.setDate(date.getDate() + offset);
    return date.toISOString().split('T')[0];
}

export const formatDate = (dateString: string, options?: FormatDateOptions) => {
    const date = parseDate(dateString);
    if (!date) {
        return INVALID_DATE_LABEL;
    }

    return date.toLocaleDateString("es-ES", {
        year: options?.excludeYear ? undefined : "numeric",
        month: options?.excludeMonth ? undefined : options?.shortMonth ? "short" : "long",
        day: options?.excludeDay ? undefined : "2-digit",
    });
};

export const formatBudget = (budget: number) => {
    const [integerPart, decimalPart = "00"] = budget.toFixed(2).split(".");
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    if (integerPart === "0" && decimalPart === "00") return "---";
    return `${formattedInteger}, ${decimalPart} €`;
};

export const formatPeople = (people: number) => {
    if (people === 1) return "1 persona";
    return `${people} personas`;
};

export const formatStatus = (status: ItineraryStatus) => {
    if (status === "DRAFT") return "Borrador";
    if (status === "PLANNED") return "Planeado";
    if (status === "ONGOING") return "En curso";
    if (status === "COMPLETED") return "Completado";
    return status;
};

export const formatImageAuthorUrl = (username: string) => {
    return `https://unsplash.com/@${username}`;
};

export const formatCollaboratorRole = (role: CollaboratorRole) => {
    if (role === "OWNER") return "Propietario";
    if (role === "EDITOR") return "Editor";
    if (role === "VIEWER") return "Lector";
    return role;
};
