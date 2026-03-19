import "@styles/globals.css";
import "leaflet/dist/leaflet.css";

import { createRoot } from "react-dom/client";
import { AuthProvider } from "@/providers/authProvider";
import { DemoProvider } from "@/providers/demoProvider";
import { NotificationProvider } from "@/providers/notificationProvider";
import { WebSocketProvider } from "@/providers/webSocketProvider";

import Router from "@/Router";

createRoot(document.getElementById("root")!).render(
    <DemoProvider>
        <AuthProvider>
            <WebSocketProvider>
                <NotificationProvider>
                    <Router />
                </NotificationProvider>
            </WebSocketProvider>
        </AuthProvider>
    </DemoProvider>
);
