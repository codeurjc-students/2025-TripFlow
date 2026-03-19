import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router";
import { pdf } from "@react-pdf/renderer";

import type { ExtendedItinerary as Itinerary } from "@/types/itinerary";

import { getItineraryById } from "@/services/itineraryService";
import { useModal } from "@/hooks/useModal";
import { useNotification } from "@/providers/notificationProvider";

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

    const { id } = useParams<{ id: string }>();
    const itineraryId = Number(id);
    if (isNaN(itineraryId)) return <Navigate to="/itineraries" />;

    useEffect(() => {
        const fetchItinerary = async () => {
            setIsLoading(true);

            const itineraryData = await getItineraryById(itineraryId);
            setItinerary(itineraryData);

            setIsLoading(false);
        };

        fetchItinerary();
    }, [id]);

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
        <AppLayout>
            <InnerTabHeader
                title={itinerary?.title || ""}
                back={{ url: "/itineraries", label: "Volver" }}
                right={
                    itinerary?.permissions?.edit ? (
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
