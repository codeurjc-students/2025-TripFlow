import { DownloadIcon } from "lucide-react";

import Button from "@components/shared/Button";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";

interface InstallButtonProps {
    style?: Parameters<typeof Button>[0]["style"];
    label?: string;
    fallback?: React.ReactNode;
}

/** Fires the native PWA install prompt. Renders `fallback` (or nothing)
 *  when the browser can't offer install. */
export default function InstallButton({
    style = ["bordered"],
    label = "Instalar app",
    fallback = null,
}: InstallButtonProps) {
    const { canInstall, promptInstall } = useInstallPrompt();

    if (!canInstall) return fallback;

    return (
        <Button style={style} label={label} onClick={promptInstall} ariaLabel="Instalar TripFlow">
            <DownloadIcon size={18} />
        </Button>
    );
}
