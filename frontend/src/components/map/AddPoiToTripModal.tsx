import styles from "@styles/components/map/AddPoiToTripModal.module.css";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeftIcon, PlusCircleIcon, RouteIcon, XIcon } from "lucide-react";

import type { MapSuggestion } from "@/types/map";
import type { EditableItineraryOption } from "@/hooks/useAddPoiToTrip";
import { getPreferredDayNumber, getPreferredItineraryId } from "@/hooks/useAddPoiToTrip";

import Button from "@/components/shared/Button";
import CustomSelect from "@/components/shared/CustomSelect";

type ModalStep = "itinerary" | "details";

interface AddPoiToTripModalProps {
    isOpen: boolean;
    poi: MapSuggestion | null;
    itineraries: EditableItineraryOption[];
    isLoadingItineraries: boolean;
    isSubmitting: boolean;
    onClose: () => void;
    onConfirmAdd: (payload: { itineraryId: number; dayNumber: number; time?: string; duration?: string }) => Promise<void>;
    onNavigate: () => void;
}

export default function AddPoiToTripModal({
    isOpen,
    poi,
    itineraries,
    isLoadingItineraries,
    isSubmitting,
    onClose,
    onConfirmAdd,
    onNavigate,
}: AddPoiToTripModalProps) {
    const [step, setStep] = useState<ModalStep>("itinerary");
    const [selectedItineraryId, setSelectedItineraryId] = useState<number | null>(null);
    const [selectedDay, setSelectedDay] = useState(1);
    const [time, setTime] = useState("");
    const [duration, setDuration] = useState("");

    const selectedItinerary = useMemo(
        () => itineraries.find((option) => option.id === selectedItineraryId) || null,
        [itineraries, selectedItineraryId]
    );

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const preferredItineraryId = getPreferredItineraryId(itineraries);
        setSelectedItineraryId(preferredItineraryId);

        const preferredDays = itineraries.find((itinerary) => itinerary.id === preferredItineraryId)?.countDays || 1;
        setSelectedDay(getPreferredDayNumber(preferredDays));
        setTime("");
        setDuration("");
        setStep("itinerary");
    }, [isOpen, itineraries]);

    useEffect(() => {
        if (!isOpen) return;

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        document.addEventListener("keydown", handleEscape);
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "unset";
        };
    }, [isOpen, onClose]);

    if (!isOpen || !poi) {
        return null;
    }

    const hasEditableItineraries = itineraries.length > 0;
    const dayOptions = Array.from({ length: Math.max(1, selectedItinerary?.countDays || 1) }, (_, index) => ({
        label: `Dia ${index + 1}`,
        value: String(index + 1),
    }));

    const handleContinue = () => {
        if (!selectedItineraryId) return;
        const maxDays = selectedItinerary?.countDays || 1;
        setSelectedDay((current) => Math.max(1, Math.min(maxDays, current)));
        setStep("details");
    };

    const handleConfirm = async () => {
        if (!selectedItineraryId) return;
        await onConfirmAdd({
            itineraryId: selectedItineraryId,
            dayNumber: selectedDay,
            time,
            duration,
        });
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
                <header className={styles.header}>
                    <div className={styles.headerText}>
                        <h2 className={styles.title}>Agregar punto al viaje</h2>
                        <p className={styles.subtitle}>{poi.name}</p>
                    </div>
                    <Button style={["tool_bordered"]} onClick={onClose} ariaLabel="Cerrar modal">
                        <XIcon size={18} />
                    </Button>
                </header>

                <main className={styles.body}>
                    {isLoadingItineraries ? (
                        <p className={styles.message}>Cargando tus viajes...</p>
                    ) : !hasEditableItineraries ? (
                        <p className={styles.message}>No tienes viajes editables para agregar este lugar.</p>
                    ) : step === "itinerary" ? (
                        <div className={styles.stepContent}>
                            <span className={styles.stepTitle}>Paso 1: Elige viaje</span>
                            <CustomSelect
                                id="add-poi-itinerary"
                                value={String(selectedItineraryId || "")}
                                onChange={(value) => {
                                    const itineraryId = Number(value);
                                    const itinerary = itineraries.find((entry) => entry.id === itineraryId);
                                    setSelectedItineraryId(itineraryId);
                                    setSelectedDay(getPreferredDayNumber(itinerary?.countDays || 1));
                                }}
                                options={itineraries.map((itinerary) => ({
                                    value: String(itinerary.id),
                                    label: itinerary.title,
                                }))}
                                placeholder="Selecciona itinerario"
                            />
                            <p className={styles.supportText}>Primero elegimos el viaje, luego el dia y detalles.</p>
                        </div>
                    ) : (
                        <div className={styles.stepContent}>
                            <span className={styles.stepTitle}>Paso 2: Dia y detalles</span>
                            <div className={styles.selectedTripBox}>
                                <strong>{selectedItinerary?.title}</strong>
                                <button type="button" className={styles.linkButton} onClick={() => setStep("itinerary")}>
                                    Cambiar viaje
                                </button>
                            </div>

                            <div className={styles.gridRow}>
                                <label className={styles.fieldLabel} htmlFor="add-poi-day">Dia</label>
                                <CustomSelect
                                    id="add-poi-day"
                                    value={String(selectedDay)}
                                    onChange={(value) => setSelectedDay(Number(value))}
                                    options={dayOptions}
                                    placeholder="Selecciona dia"
                                />
                            </div>

                            <div className={styles.gridTwoCols}>
                                <div className={styles.gridRow}>
                                    <label className={styles.fieldLabel} htmlFor="add-poi-time">Hora (opcional)</label>
                                    <input
                                        id="add-poi-time"
                                        type="time"
                                        value={time}
                                        onChange={(event) => setTime(event.target.value)}
                                    />
                                </div>

                                <div className={styles.gridRow}>
                                    <label className={styles.fieldLabel} htmlFor="add-poi-duration">Duracion (opcional)</label>
                                    <input
                                        id="add-poi-duration"
                                        type="text"
                                        placeholder="1h 30m"
                                        value={duration}
                                        onChange={(event) => setDuration(event.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </main>

                <footer className={styles.footer}>
                    {step === "details" && hasEditableItineraries ? (
                        <Button style={["secondary"]} onClick={() => setStep("itinerary")}>
                            <ChevronLeftIcon size={16} />
                            Volver
                        </Button>
                    ) : (
                        <Button style={["secondary"]} onClick={onNavigate}>
                            <RouteIcon size={16} />
                            Navegar
                        </Button>
                    )}

                    {step === "itinerary" ? (
                        <Button
                            style={["primary"]}
                            onClick={handleContinue}
                            disabled={!hasEditableItineraries || !selectedItineraryId}
                        >
                            Continuar
                        </Button>
                    ) : (
                        <Button
                            style={["primary"]}
                            onClick={() => void handleConfirm()}
                            disabled={!selectedItineraryId || isSubmitting}
                        >
                            <PlusCircleIcon size={16} />
                            {isSubmitting ? "Agregando..." : "Agregar al viaje"}
                        </Button>
                    )}
                </footer>
            </div>
        </div>
    );
}
