import { useEffect, useRef } from "react";
import L from "leaflet";

interface CurrentLocationLayerProps {
    map: L.Map;
    latitude: number;
    longitude: number;
}

export default function CurrentLocationLayer({ map, latitude, longitude }: CurrentLocationLayerProps) {
    const markerRef = useRef<L.Marker | null>(null);

    const currentLocationIcon = L.divIcon({
        className: "current-location-marker",
        html: "<span class=\"map-pin-dot\"></span>",
        iconSize: [16, 16],
        iconAnchor: [10, 10],
    });

    useEffect(() => {
        const point: L.LatLngExpression = [latitude, longitude];

        if (!markerRef.current) {
            markerRef.current = L.marker(point, { icon: currentLocationIcon }).addTo(map);
            markerRef.current.setZIndexOffset(1500);
            markerRef.current.bindTooltip("Tu ubicación", {
                direction: "top",
                offset: [0, -6],
                className: "current-location-tooltip",
            });
        } else {
            markerRef.current.setLatLng(point);
        }

        return () => {
            if (markerRef.current) {
                markerRef.current.remove();
                markerRef.current = null;
            }
        };
    }, [map, latitude, longitude]);

    return null;
}
