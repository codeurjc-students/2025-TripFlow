import styles from "@styles/layouts/AppLayout.module.css";

import type { ReactNode } from "react";

import Sidebar from "@components/shared/Sidebar";

interface LayoutProps {
    admin?: boolean;
    external?: boolean;
    children: ReactNode;
}

export default function AppLayout({ admin, external = false, children }: LayoutProps) {
    return (
        <div className={`${styles.layout} ${external ? styles.external : ""}`}>
            {!external && <Sidebar admin={admin} />}
            <main className={`${styles.main} ${external ? styles.mainExternal : ""}`}>
                {children}
            </main>
        </div>
    );
}