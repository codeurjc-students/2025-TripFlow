import { useEffect } from "react";
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from "react-router";



import IndexPage from "@pages/Index";
import LoginPage from "@pages/Login";
import RegisterPage from "@pages/Register";
import VerifyPage from "@pages/Verify";
import HelpPage from "@pages/Help";
import DashboardPage from "@pages/Dashboard";
import ItinerariesPage from "@pages/itineraries/Itineraries";
import ItineraryDetailPage from "@pages/itineraries/ItineraryDetail";
import ItineraryNewPage from "@pages/itineraries/ItineraryNew";
import ItineraryEditPage from "@pages/itineraries/ItineraryEdit";
import ProfilePage from "@pages/profile/Profile";
import ProfileEditPage from "@pages/profile/ProfileEdit";
import NotificationsPage from "@pages/Notifications";
import AdminPage from "@pages/Admin";
import NotFound from "@pages/NotFound";

import { useAuth } from "@/providers/authProvider";
import { useDemo } from "@/providers/demoProvider";
import { useNotifications } from "@/hooks/notifications/useNotifications";

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
                <Route path="/help" element={<HelpPage />} />

                {/* Private routes */}
                <Route element={<PrivateWrapper />}>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/itineraries">
                        <Route index element={<ItinerariesPage />} />
                        <Route path=":id">
                            <Route index element={<ItineraryDetailPage />} />
                            <Route path="edit" element={<ItineraryEditPage />} />
                        </Route>
                        <Route path="new" element={<ItineraryNewPage />} />
                    </Route>
                    <Route path="/notifications" element={<NotificationsPage />} />
                    <Route path="/profile">
                        <Route index element={<ProfilePage />} />
                        <Route path="edit" element={<ProfileEditPage />} />
                    </Route>
                </Route>

                {/* Admin routes */}
                <Route element={<AdminWrapper />}>
                    <Route path="/admin" element={<AdminPage />} />
                </Route>

                {/* Catch-all route for 404 Not Found */}
                <Route path="/404" element={<NotFound />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
        </BrowserRouter>
    );
}
