import styles from "@styles/components/shared/Sidebar.module.css";

import { useLocation } from "react-router";

import {
    HomeIcon,
    MapIcon,
    SearchIcon,
    UserIcon,
} from "lucide-react";

import Button from "@components/shared/Button";
import Logo from "@components/shared/Logo";

const ROUTES = [
    { path: "/dashboard", label: "Dashboard", icon: <HomeIcon /> },
    { path: "/itineraries", label: "Itinerarios", icon: <MapIcon /> },
    { path: "/map/explore", label: "Explorar", icon: <SearchIcon /> },
    { path: "/profile", label: "Perfil", icon: <UserIcon /> },
];

const ADMIN_ROUTES = [
    { path: "/admin", label: "Admin", icon: <UserIcon /> },
];

export default function Sidebar({ admin, hideOnMobile = false }: { admin?: boolean; hideOnMobile?: boolean }) {
    const location = useLocation();
    const routes = admin ? ADMIN_ROUTES : ROUTES;

    return (
        <aside className={`${styles.sidebar} ${hideOnMobile ? styles.hideOnMobile : ""}`}>
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
