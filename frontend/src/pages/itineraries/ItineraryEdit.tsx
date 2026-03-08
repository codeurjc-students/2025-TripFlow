import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router";

import type { ExtendedItinerary as Itinerary } from "@/types/itinerary";

import { deleteItinerary, getItineraryById, updateItinerary } from "@/services/itineraryService";

import AppLayout from "@/layouts/AppLayout";
import Loader from "@/components/shared/Loader";
import ItineraryEditor from "@/components/dashboard/itineraries/ItineraryEditor";
import { useNotification } from "@/providers/notificationProvider";

export default function ItineraryEdit() {
    const [itinerary, setItinerary] = useState<Itinerary | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const { notify } = useNotification();
    const navigate = useNavigate();

    const { id } = useParams<{ id: string }>();
    const itineraryId = Number(id);
    if (isNaN(itineraryId)) return <Navigate to="/itineraries" />;

    const handleSave = async (itinerary: Itinerary) => {
        setIsSaving(true);
        const res = await updateItinerary(itineraryId, itinerary);
        setIsSaving(false);

        if (!res || !res.id) {
            notify("Ha ocurrido un error al actualizar el itinerario.", "error", {
                title: "Error",
                duration: 5000
            });
            return;
        }

        notify("Itinerario actualizado correctamente.", "success", {
            title: "Éxito",
        });
        navigate(`/itineraries/${itineraryId}`);
    }

    const handleDelete = async () => {
        await deleteItinerary(itineraryId);

        notify("Itinerario eliminado correctamente", "success", {
            title: "Itinerario eliminado",
        });

        navigate("/itineraries");
    };

    useEffect(() => {
        const fetchItinerary = async () => {
            setIsLoading(true);

            const itineraryData = await getItineraryById(itineraryId);
            
            if (itineraryData && !itineraryData.permissions?.edit) {
                notify("No tienes permisos para editar este itinerario", "error", {
                    title: "Acceso denegado"
                });
                navigate(`/itineraries/${itineraryId}`);
                return;
            }

            setItinerary(itineraryData);
            setIsLoading(false);
        };

        fetchItinerary();
    }, [id]);

    return (
        <AppLayout>
            {isLoading && <Loader size={32} variant="dots" />}
            {itinerary && (
                <ItineraryEditor
                    type="edit"
                    initialItinerary={itinerary}
                    onSave={handleSave}
                    onDelete={handleDelete}
                    isSaving={isSaving}
                    back={{ url: `/itineraries/${id}`, label: "Cancelar" }}
                />
            )}
        </AppLayout>
    );
}
