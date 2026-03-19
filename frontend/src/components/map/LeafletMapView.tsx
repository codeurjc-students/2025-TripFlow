import { useEffect, useRef } from "react";
import L from "leaflet";
import type { LatLngBoundsExpression, LatLngTuple } from "leaflet";

import { DEFAULT_CENTER, DEFAULT_ZOOM, FIT_BOUNDS_PADDING } from "@/utils/mapGeometry";

interface LeafletMapViewProps {
    bounds: LatLngBoundsExpression | null;
    children?: (map: L.Map) => React.ReactNode;
    onMapReady?: (map: L.Map) => void;
    className?: string;
}

const TILE_URL = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

export default function LeafletMapView({
    bounds,
    children,
    onMapReady,
    className,
}: LeafletMapViewProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<L.Map | null>(null);

    useEffect(() => {
        if (!containerRef.current || mapRef.current) return;

        const map = L.map(containerRef.current, {
            center: DEFAULT_CENTER,
            zoom: DEFAULT_ZOOM,
            zoomControl: false,
            attributionControl: false,
        });

        L.tileLayer(TILE_URL, {
            maxZoom: 19,
        }).addTo(map);

        L.control.zoom({ position: "topright" }).addTo(map);

        mapRef.current = map;
        onMapReady?.(map);

        return () => {
            map.remove();
            mapRef.current = null;
        };
    }, []);

    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        if (bounds) {
            map.fitBounds(bounds as L.LatLngBoundsExpression, {
                padding: FIT_BOUNDS_PADDING,
                maxZoom: 16,
            });
        } else {
            map.setView(DEFAULT_CENTER, DEFAULT_ZOOM);
        }
    }, [bounds]);

    return (
        <>
            <div ref={containerRef} className={className} />
            {mapRef.current && children?.(mapRef.current)}
        </>
    );
}

/** Hook to re-center map to current bounds. */
export function useRecenter(
    map: L.Map | null,
    bounds: LatLngBoundsExpression | null
) {
    return () => {
        if (!map) return;
        if (bounds) {
            map.fitBounds(bounds as L.LatLngBoundsExpression, {
                padding: FIT_BOUNDS_PADDING,
                maxZoom: 16,
            });
        } else {
            map.setView(DEFAULT_CENTER as LatLngTuple, DEFAULT_ZOOM);
        }
    };
}
