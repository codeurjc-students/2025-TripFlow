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
                <div className={styles.ctaContent}>
                    <span className={styles.ctaEyebrow}>Experiencia IA</span>
                    <h3 className={styles.ctaHeading}>Tu viaje en segundos</h3>
                    <p>
                        ¿Estás preparado para planear tu próximo viaje? Descubre el poder de nuestra IA
                        para crear itinerarios útiles y detallados al instante.
                    </p>
                    <div className={styles.ctaAction}>
                        <Button
                            style={["primary", "big", "full"]}
                            label="Comenzar"
                            to="/itineraries/new?editorType=ai"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
