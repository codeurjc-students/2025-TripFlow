import { useEffect, useRef } from "react";
import L from "leaflet";
import type { LatLngTuple } from "leaflet";

interface ItineraryRouteLayerProps {
    map: L.Map;
    path: LatLngTuple[];
    isHidden?: boolean;
}

const ROUTE_STYLE: L.PolylineOptions = {
    color: "#33a7d8",
    weight: 3,
    opacity: 0.8,
    dashArray: "8, 6",
    lineJoin: "round",
    lineCap: "round",
};

export default function ItineraryRouteLayer({ map, path, isHidden = false }: ItineraryRouteLayerProps) {
    const polylineRef = useRef<L.Polyline | null>(null);

    useEffect(() => {
        if (polylineRef.current) {
            polylineRef.current.remove();
            polylineRef.current = null;
        }

        if (!isHidden && path.length >= 2) {
            polylineRef.current = L.polyline(path, ROUTE_STYLE).addTo(map);
        }

        return () => {
            if (polylineRef.current) {
                polylineRef.current.remove();
                polylineRef.current = null;
            }
        };
    }, [map, path, isHidden]);

    return null;
}
