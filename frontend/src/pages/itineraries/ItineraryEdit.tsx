import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router";

import type { ExtendedItinerary as Itinerary } from "@/types/itinerary";

import { deleteItinerary, getItineraryById, updateItinerary } from "@/services/itineraryService";
import { OfflineReadOnlyError } from "@/services/httpService";
import { useOfflineMode } from "@/hooks/useOfflineMode";

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
    const { readOnly } = useOfflineMode();

    const { id } = useParams<{ id: string }>();
    const itineraryId = Number(id);
    if (isNaN(itineraryId)) return <Navigate to="/itineraries" />;

    const handleSave = async (itinerary: Itinerary) => {
        setIsSaving(true);
        try {
            const res = await updateItinerary(itineraryId, itinerary);
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
        } catch (error) {
            if (error instanceof OfflineReadOnlyError) {
                notify("Sin conexion: la edicion esta deshabilitada.", "info", {
                    title: "Modo offline",
                });
                navigate(`/itineraries/${itineraryId}`);
                return;
            }

            notify("Ha ocurrido un error al actualizar el itinerario.", "error", {
                title: "Error",
                duration: 5000
            });
        } finally {
            setIsSaving(false);
        }
    }

    const handleDelete = async () => {
        try {
            await deleteItinerary(itineraryId);

            notify("Itinerario eliminado correctamente", "success", {
                title: "Itinerario eliminado",
            });

            navigate("/itineraries");
        } catch (error) {
            if (error instanceof OfflineReadOnlyError) {
                notify("Sin conexion: no puedes eliminar en modo offline.", "info", {
                    title: "Modo offline",
                });
                navigate(`/itineraries/${itineraryId}`);
                return;
            }

            notify("Ha ocurrido un error al eliminar el itinerario.", "error", {
                title: "Error",
                duration: 5000,
            });
        }
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
                    readOnly={readOnly}
                    back={{ url: `/itineraries/${id}`, label: "Cancelar" }}
                />
            )}
        </AppLayout>
    );
}
