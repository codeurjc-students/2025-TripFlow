import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";

import Button from "@/components/shared/Button";

interface MapPanelToggleProps {
    isCollapsed: boolean;
    onToggle: () => void;
}

export default function MapPanelToggle({ isCollapsed, onToggle }: MapPanelToggleProps) {
    return (
        <Button
            style={["tool_bordered", "rounded"]}
            onClick={onToggle}
            ariaLabel={isCollapsed ? "Expandir panel" : "Contraer panel"}
        >
            {isCollapsed ? <ChevronUpIcon size={18} /> : <ChevronDownIcon size={18} />}
        </Button>
    );
}
