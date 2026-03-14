import styles from "@styles/components/shared/Sidebar.module.css";

import { useLocation } from "react-router";

import {
    HomeIcon,
    MapIcon,
    BellIcon,
    UserIcon,
} from "lucide-react";

import Button from "@components/shared/Button";
import Logo from "@components/shared/Logo";

const ROUTES = [
    { path: "/dashboard", label: "Dashboard", icon: <HomeIcon /> },
    { path: "/itineraries", label: "Itinerarios", icon: <MapIcon /> },
    { path: "/notifications", label: "Notificaciones", icon: <BellIcon /> },
    { path: "/profile", label: "Perfil", icon: <UserIcon /> },
];

const ADMIN_ROUTES = [
    { path: "/admin", label: "Admin", icon: <UserIcon /> },
];

export default function Sidebar({ admin }: { admin?: boolean }) {
    const location = useLocation();
    const routes = admin ? ADMIN_ROUTES : ROUTES;

    return (
        <aside className={styles.sidebar}>
            <div className={styles.logo}>
                <Button style={["logo"]} to="/">
                    <Logo size="small" />
                </Button>
            </div>
            <nav className={styles.nav}>
                {routes.map((route) => (
                    <Button
                        key={route.path}
                        style={
                            location.pathname.includes(route.path)
                                ? ["route", "active"]
                                : ["route"]
                        }
                        to={route.path}
                        label={route.label}
                    >
                        {route.icon}
                    </Button>
                ))}
            </nav>
        </aside>
    );
}