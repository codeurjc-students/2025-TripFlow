import type { ReactNode } from "react";
import type L from "leaflet";

import LeafletMapView from "@/components/map/LeafletMapView";

interface MapPageShellProps {
    className: string;
    mapClassName: string;
    bounds: L.LatLngBoundsExpression | null;
    onMapReady: (map: L.Map) => void;
    renderLayers: (map: L.Map) => ReactNode;
    topBar: ReactNode;
    bottomPanel: ReactNode;
}

export default function MapPageShell({
    className,
    mapClassName,
    bounds,
    onMapReady,
    renderLayers,
    topBar,
    bottomPanel,
}: MapPageShellProps) {
    return (
        <div className={className}>
            <LeafletMapView bounds={bounds} onMapReady={onMapReady} className={mapClassName}>
                {(map) => renderLayers(map)}
            </LeafletMapView>
            {topBar}
            {bottomPanel}
        </div>
    );
}
