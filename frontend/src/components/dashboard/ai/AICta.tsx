import Button from "@/components/shared/Button";
import styles from "@styles/components/dashboard/ai/AICta.module.css";

import { Sparkles } from "lucide-react";

export default function AICta() {
    return (
        <section className={styles.aiCtaSection}>
            <div className={styles.aiCtaHeader}>
                <Sparkles size={24} className={styles.aiCtaIcon} />
                <h2 className={styles.aiCtaTitle}>Asistente con IA</h2>
            </div>
            <div className={styles.cta}>
                <p>¿Estás preparado para planear tu próximo viaje? Descubre el poder de nuestra IA para ayudarte a planificar tus viajes en cuestión de segundos.</p>
                <Button
                    style={["primary", "big", "full"]}
                    label="Comenzar"
                    to="/itineraries/new?editorType=ai"
                />
            </div>
        </section>
    );
}
