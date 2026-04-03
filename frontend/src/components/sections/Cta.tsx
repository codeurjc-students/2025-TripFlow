import styles from "@styles/components/sections/Cta.module.css";

import Section from "@components/shared/Section";
import DemoButton from "@components/buttons/DemoButton";

export default function Cta() {
  return (
    <Section
      title={
        <>
          Empieza a planificar un viaje <strong>sin fricciones</strong>
        </>
      }
    >
      <div className={styles.ctaSurface}>
        <div className={styles.ctaContent}>
          <p className={styles.ctaLead}>
            Diseña tu itinerario en minutos y organiza cada parada en un solo
            lugar.
          </p>
          <p className={styles.ctaText}>
            Prueba la demo y empieza a planificar hoy.
          </p>
          <div className={styles.actions}>
            <DemoButton style="primary" />
          </div>
        </div>
      </div>
    </Section>
  );
}
