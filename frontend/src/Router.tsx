import { useEffect } from "react";
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from "react-router";



import IndexPage from "@pages/Index";
import LoginPage from "@pages/Login";
import RegisterPage from "@pages/Register";
import VerifyPage from "@pages/Verify";
import ForgotPasswordPage from "@pages/ForgotPassword";
import ResetPasswordPage from "@pages/ResetPassword";
import HelpPage from "@pages/Help";
import DashboardPage from "@pages/Dashboard";
import ItinerariesPage from "@pages/itineraries/Itineraries";
import ItineraryDetailPage from "@pages/itineraries/ItineraryDetail";
import SharedItineraryPage from "@pages/itineraries/SharedItinerary";
import ItineraryNewPage from "@pages/itineraries/ItineraryNew";
import ItineraryEditPage from "@pages/itineraries/ItineraryEdit";
import ItineraryMapPage from "@pages/itineraries/ItineraryMap";
import MapExplorePage from "@pages/map/MapExplore";
import ProfilePage from "@pages/profile/Profile";
import ProfileEditPage from "@pages/profile/ProfileEdit";
import NotificationsPage from "@pages/Notifications";
import AdminPage from "@pages/Admin";
import NotFound from "@pages/NotFound";

import { useAuth } from "@/providers/authProvider";
import { useDemo } from "@/providers/demoProvider";
import { useOfflineMode } from "@/hooks/useOfflineMode";
import { useNotifications } from "@/hooks/notifications/useNotifications";
import { useNotification } from "@/providers/notificationProvider";

function PrivateWrapper() {
    const { demo } = useDemo();
    const { user } = useAuth();

    if (demo) return <Outlet />;
    if (!user) return <Navigate to="/login" replace />;

    return <Outlet />;
}

function AdminWrapper() {
    const { user } = useAuth();

    if (!user) return <Navigate to="/login" replace />;
    if (user.role !== "ADMIN") return <Navigate to="/dashboard" replace />;

    return <Outlet />;
}

function OfflineReadOnlyWrapper({ fallbackPath }: { fallbackPath: string }) {
    const { readOnly } = useOfflineMode();
    const { notify } = useNotification();

    useEffect(() => {
        if (readOnly) {
            notify("Sin conexión: solo lectura disponible.", "info", {
                title: "Modo offline",
            });
        }
    }, [readOnly, notify]);

    if (readOnly) {
        return <Navigate to={fallbackPath} replace />;
    }

    return <Outlet />;
}

/**
 * Sets up WebSocket notifications.
 */
function NotificationsInitializer() {
    useNotifications();
    return null;
}

/**
 * Component that resets the scroll position to the top of the page
 * whenever the route path changes.
 */
function ScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
}

export default function Router() {
    return (
        <BrowserRouter>
            <NotificationsInitializer />
            <ScrollToTop />
            <Routes>
                {/* Public routes */}
                <Route index element={<IndexPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<RegisterPage />} />
                <Route path="/verify" element={<VerifyPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/help" element={<HelpPage />} />
                <Route path="/share/:token" element={<SharedItineraryPage />} />

                {/* Private routes */}
                <Route element={<PrivateWrapper />}>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/itineraries">
                        <Route index element={<ItinerariesPage />} />
                        <Route path=":id">
                            <Route index element={<ItineraryDetailPage />} />
                            <Route path="map" element={<ItineraryMapPage />} />
                            <Route element={<OfflineReadOnlyWrapper fallbackPath="/itineraries" />}>
                                <Route path="edit" element={<ItineraryEditPage />} />
                            </Route>
                        </Route>
                        <Route element={<OfflineReadOnlyWrapper fallbackPath="/itineraries" />}>
                            <Route path="new" element={<ItineraryNewPage />} />
                        </Route>
                    </Route>
                    <Route path="/dashboard/notifications" element={<NotificationsPage />} />
                    <Route path="/map/explore" element={<MapExplorePage />} />
                    <Route path="/profile">
                        <Route index element={<ProfilePage />} />
                        <Route element={<OfflineReadOnlyWrapper fallbackPath="/profile" />}>
                            <Route path="edit" element={<ProfileEditPage />} />
                        </Route>
                    </Route>
                </Route>

                {/* Admin routes */}
                <Route element={<AdminWrapper />}>
                    <Route element={<OfflineReadOnlyWrapper fallbackPath="/dashboard" />}>
                        <Route path="/admin" element={<AdminPage />} />
                    </Route>
                </Route>

                {/* Catch-all route for 404 Not Found */}
                <Route path="/404" element={<NotFound />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
        </BrowserRouter>
    );
}
