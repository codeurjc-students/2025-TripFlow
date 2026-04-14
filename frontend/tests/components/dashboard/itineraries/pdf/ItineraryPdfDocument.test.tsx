import { pdf } from "@react-pdf/renderer";
import { describe, expect, it } from "vitest";

import ItineraryPdfDocument from "@/components/dashboard/itineraries/pdf/ItineraryPdfDocument";
import type { ExtendedItinerary } from "@/types/itinerary";

function readBlobWithFileReader(blob: Blob): Promise<Uint8Array> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            const result = reader.result;
            if (!(result instanceof ArrayBuffer)) {
                reject(new Error("Could not read PDF blob data"));
                return;
            }
            resolve(new Uint8Array(result));
        };

        reader.onerror = () => reject(reader.error || new Error("FileReader failed"));
        reader.readAsArrayBuffer(blob);
    });
}

function createLargeItinerary(daysCount: number, activitiesPerDay: number): ExtendedItinerary {
    return {
        id: 99,
        title: "Itinerario Largo de Prueba",
        place: "Madrid, Espana",
        people: 4,
        budget: 5200,
        date: "2026-05-10",
        status: "PLANNED",
        countDays: daysCount,
        tags: ["prueba", "larga"],
        coverImage: {
            altDescription: "Imagen de prueba",
            imageUrl: "https://example.com/cover.jpg",
            authorUsername: "tester",
        },
        permissions: {
            view: true,
            edit: true,
            delete: true,
        },
        days: Array.from({ length: daysCount }, (_, dayIndex) => ({
            day: dayIndex + 1,
            activities: Array.from({ length: activitiesPerDay }, (_, activityIndex) => ({
                activity: `Actividad ${activityIndex + 1} del dia ${dayIndex + 1}`,
                details: "Descripcion extensa de prueba para forzar saltos de pagina y validar que el PDF no se rompe cuando el contenido crece de forma considerable.",
                location: {
                    name: "Lugar de prueba",
                    address: "Calle de Prueba 123, Madrid",
                    coordinates: {
                        latitude: 40.4168,
                        longitude: -3.7038,
                    },
                },
                time: `${String((activityIndex % 12) + 8).padStart(2, "0")}:00`,
                duration: "2h",
            })),
        })),
    };
}

describe("ItineraryPdfDocument pagination", () => {
    it("generates a PDF blob for long itineraries", async () => {
        const itinerary = createLargeItinerary(15, 6);

        const blob = await pdf(
            <ItineraryPdfDocument itinerary={itinerary} />
        ).toBlob();

        expect(blob).toBeInstanceOf(Blob);
        expect(blob.size).toBeGreaterThan(0);
    }, 15000);

    it("creates multiple pages when content is long", async () => {
        const itinerary = createLargeItinerary(18, 7);

        const blob = await pdf(
            <ItineraryPdfDocument itinerary={itinerary} />
        ).toBlob();

        const bytes = await readBlobWithFileReader(blob);
        const rawPdf = Buffer.from(bytes).toString("latin1");
        const pageMatches = rawPdf.match(/\/Type\s*\/Page\b/g) || [];

        expect(pageMatches.length).toBeGreaterThan(1);
    }, 15000);
});
