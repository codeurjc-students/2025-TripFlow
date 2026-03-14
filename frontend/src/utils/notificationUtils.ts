import type { NotificationType } from "@/types/notification";
import type { NotificationRendererType } from "@/components/shared/Notification";

interface NotificationDetails {
    title: string;
    message: string;
    type: NotificationRendererType;
}

export const getNotificationDetails = (type: NotificationType): NotificationDetails => {
    switch (type) {
        case "ITINERARY_GENERATED":
            return {
                title: "Itinerario Generado",
                message: "Tu itinerario ha sido generado correctamente",
                type: "success",
            };
        case "ITINERARY_GENERATION_FAILED":
            return {
                title: "Error al generar itinerario",
                message: "Hubo un error al generar tu itinerario",
                type: "error",
            };
        case "INVITATION_RECEIVED":
            return {
                title: "Nueva invitación",
                message: "Has recibido una invitación para colaborar en un viaje",
                type: "info",
            };
        case "INVITATION_ACCEPTED":
            return {
                title: "Invitación aceptada",
                message: "Un usuario ha aceptado tu invitación de colaboración",
                type: "success",
            };
    }
}