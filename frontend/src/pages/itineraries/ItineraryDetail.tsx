import { useCallback, useEffect, useState } from "react";
import { Navigate, useParams } from "react-router";
import { pdf } from "@react-pdf/renderer";

import type { ExtendedItinerary as Itinerary } from "@/types/itinerary";

import { getItineraryById } from "@/services/itineraryService";
import { OfflineNoCacheError } from "@/services/httpService";
import { useModal } from "@/hooks/useModal";
import { useNotification } from "@/providers/notificationProvider";
import { useItineraryChangeEvents } from "@/hooks/notifications/useItineraryChangeEvents";
import { useOfflineMode } from "@/hooks/useOfflineMode";

import AppLayout from "@/layouts/AppLayout";
import Loader from "@/components/shared/Loader";
import InnerTabHeader from "@components/dashboard/headers/InnerTabHeader";
import ExtendedItinerary from "@/components/dashboard/itineraries/ExtendedItinerary";
import Button from "@/components/shared/Button";
import CollaborationModal from "@/components/dashboard/itineraries/CollaborationModal";
import ItineraryPdfDocument from "@/components/dashboard/itineraries/pdf/ItineraryPdfDocument";

export default function ItineraryDetailPage() {
    const [itinerary, setItinerary] = useState<Itinerary | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const { isOpen, openModal, closeModal } = useModal();
    const { notify } = useNotification();
    const { readOnly } = useOfflineMode();

    const { id } = useParams<{ id: string }>();
    const itineraryId = Number(id);
    if (isNaN(itineraryId)) return <Navigate to="/itineraries" />;

    const fetchItinerary = useCallback(async () => {
        setIsLoading(true);

        try {
            const itineraryData = await getItineraryById(itineraryId);
            setItinerary(itineraryData);
        } catch (error) {
            if (error instanceof OfflineNoCacheError) {
                notify("Sin conexion y sin cache para este itinerario.", "info", {
                    title: "Modo offline",
                });
                setItinerary(null);
            } else {
                notify("No se pudo cargar el itinerario.", "error", {
                    title: "Error",
                });
            }
        } finally {
            setIsLoading(false);
        }
    }, [itineraryId, notify]);

    useEffect(() => {
        fetchItinerary();
    }, [fetchItinerary]);

    useItineraryChangeEvents(itineraryId, {
        onEvent: () => {
            fetchItinerary();
            notify("Itinerario actualizado por un colaborador", "info");
        },
    });

    const handleExportPdf = async () => {
        if (!itinerary) {
            notify("No se pudo exportar el itinerario", "error");
            return;
        }

        try {
            const itineraryPdfBlob = await pdf(
                <ItineraryPdfDocument itinerary={itinerary} />
            ).toBlob();

            const downloadUrl = URL.createObjectURL(itineraryPdfBlob);
            const link = document.createElement("a");
            const currentDate = new Date().toISOString().slice(0, 10);

            link.href = downloadUrl;
            link.download = `itinerario-${itinerary.id}-${currentDate}.pdf`;

            document.body.appendChild(link);
            link.click();
            link.remove();

            URL.revokeObjectURL(downloadUrl);
            notify("Itinerario exportado en PDF", "success");
        } catch {
            notify("No se pudo exportar el itinerario", "error");
        }
    };

    return (
        <AppLayout innerPage>
            <InnerTabHeader
                title={itinerary?.title || ""}
                back={{ url: "/itineraries", label: "Volver" }}
                right={
                    itinerary?.permissions?.edit && !readOnly ? (
                        <Button
                            style={["inline"]}
                            to={`/itineraries/${itinerary?.id}/edit`}
                            label="Editar"
                        />
                    ) : undefined
                }
            />
            {isLoading && <Loader size={32} variant="dots" />}
            {itinerary && (
                <ExtendedItinerary
                    itinerary={itinerary}
                    itineraryId={itinerary.id}
                    onOpenCollaboration={openModal}
                    onExportPdf={handleExportPdf}
                />
            )}

            <CollaborationModal
                isOpen={isOpen}
                onClose={closeModal}
                itineraryId={itineraryId}
            />
        </AppLayout>
    );
}
