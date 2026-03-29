import styles from "@styles/layouts/AppLayout.module.css";

import type { ReactNode } from "react";

import Sidebar from "@components/shared/Sidebar";

interface LayoutProps {
    admin?: boolean;
    external?: boolean;
    immersive?: boolean;
    innerPage?: boolean;
    children: ReactNode;
}

export default function AppLayout({ admin, external = false, immersive = false, innerPage = false, children }: LayoutProps) {
    return (
        <div className={`${styles.layout} ${external ? styles.external : ""} ${immersive ? styles.immersive : ""}`}>
            {!external && <Sidebar admin={admin} hideOnMobile={innerPage} />}
            <main className={`${styles.main} ${external ? styles.mainExternal : ""}`}>
                {children}
            </main>
        </div>
    );
}
