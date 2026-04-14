import { useCallback, useState } from "react";

export type GeolocationStatus = "idle" | "requesting" | "granted" | "denied" | "error";

export interface GeolocationState {
    status: GeolocationStatus;
    coords: { latitude: number; longitude: number } | null;
    error: string | null;
    request: () => void;
}

export function useGeolocation(): GeolocationState {
    const [status, setStatus] = useState<GeolocationStatus>("idle");
    const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
    const [error, setError] = useState<string | null>(null);

    const request = useCallback(() => {
        if (!navigator.geolocation) {
            setStatus("error");
            setError("La geolocalizacion no esta disponible en este navegador.");
            return;
        }

        setStatus("requesting");
        setError(null);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setCoords({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
                setStatus("granted");
            },
            (geoError) => {
                if (geoError.code === geoError.PERMISSION_DENIED) {
                    setStatus("denied");
                    setError("Permiso de ubicacion denegado.");
                    return;
                }

                setStatus("error");
                setError("No pudimos obtener tu ubicacion.");
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 30000,
            }
        );
    }, []);

    return {
        status,
        coords,
        error,
        request,
    };
}
