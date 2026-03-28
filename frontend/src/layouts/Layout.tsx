import styles from "@styles/layouts/Layout.module.css";

import type { ReactNode } from "react";

import Footer from "@/components/shared/Footer";
import Header from "@/components/shared/Header";

interface LayoutProps {
    single?: boolean;
    centerContent?: boolean;
    children: ReactNode;
}

export default function Layout({ single, centerContent, children }: LayoutProps) {
    return (
        <div className={`${styles.layout} ${single ? styles.single : ""}`}>
            {!single && <Header />}
            <main className={`${styles.main} ${centerContent ? styles.mainCentered : ""}`}>
                {children}
            </main>
            {!single && <Footer />}
        </div>
    );
}