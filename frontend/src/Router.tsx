import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from "react-router";

import IndexPage from "@pages/Index";
import Loader from "@components/shared/Loader";

const LoginPage = lazy(() => import("@pages/Login"));
const RegisterPage = lazy(() => import("@pages/Register"));
const VerifyPage = lazy(() => import("@pages/Verify"));
const ForgotPasswordPage = lazy(() => import("@pages/ForgotPassword"));
const ResetPasswordPage = lazy(() => import("@pages/ResetPassword"));
const HelpPage = lazy(() => import("@pages/Help"));
const PrivacyPage = lazy(() => import("@pages/Privacy"));
const DashboardPage = lazy(() => import("@pages/Dashboard"));
const ItinerariesPage = lazy(() => import("@pages/itineraries/Itineraries"));
const ItineraryDetailPage = lazy(() => import("@pages/itineraries/ItineraryDetail"));
const SharedItineraryPage = lazy(() => import("@pages/itineraries/SharedItinerary"));
const ItineraryNewPage = lazy(() => import("@pages/itineraries/ItineraryNew"));
const ItineraryEditPage = lazy(() => import("@pages/itineraries/ItineraryEdit"));
const ItineraryMapPage = lazy(() => import("@pages/itineraries/ItineraryMap"));
const MapExplorePage = lazy(() => import("@pages/map/MapExplore"));
const ProfilePage = lazy(() => import("@pages/profile/Profile"));
const ProfileEditPage = lazy(() => import("@pages/profile/ProfileEdit"));
const NotificationsPage = lazy(() => import("@pages/Notifications"));
const AdminPage = lazy(() => import("@pages/Admin"));
const NotFound = lazy(() => import("@pages/NotFound"));

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
            <Suspense fallback={<Loader />}>
            <Routes>
                {/* Public routes */}
                <Route index element={<IndexPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<RegisterPage />} />
                <Route path="/verify" element={<VerifyPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/help" element={<HelpPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
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
            </Suspense>
        </BrowserRouter>
    );
}
