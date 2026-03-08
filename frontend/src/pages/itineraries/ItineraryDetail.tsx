import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router";

import type { ExtendedItinerary as Itinerary } from "@/types/itinerary";

import { getItineraryById } from "@/services/itineraryService";
import { useModal } from "@/hooks/useModal";

import AppLayout from "@/layouts/AppLayout";
import Loader from "@/components/shared/Loader";
import InnerTabHeader from "@components/dashboard/headers/InnerTabHeader";
import ExtendedItinerary from "@/components/dashboard/itineraries/ExtendedItinerary";
import Button from "@/components/shared/Button";
import CollaborationModal from "@/components/dashboard/itineraries/CollaborationModal";

export default function ItineraryDetailPage() {
    const [itinerary, setItinerary] = useState<Itinerary | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const { isOpen, openModal, closeModal } = useModal();

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
            {itinerary && <ExtendedItinerary itinerary={itinerary} onOpenCollaboration={openModal} />}

            <CollaborationModal
                isOpen={isOpen}
                onClose={closeModal}
                itineraryId={itineraryId}
            />
        </AppLayout>
    );
}
