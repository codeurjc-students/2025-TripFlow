import styles from "@styles/components/sections/Hero.module.css";

import { useAuth } from "@/providers/authProvider";

import { RocketIcon } from "lucide-react";

import Badge from "@components/shared/Badge";
import Button from "@components/shared/Button";
import DemoButton from "@components/buttons/DemoButton";
import InstallButton from "@components/buttons/InstallButton";

export default function Hero() {
  const { user } = useAuth();

  return (
    <section className={styles.hero} data-testid="hero-section">
      <div className={styles.content}>
        <Badge style="default">
          <>
            <RocketIcon size={16} />
            Impulsado por IA
          </>
        </Badge>
        <h1 className={styles.title}>
          Planifica tus <strong>viajes del futuro</strong>
        </h1>
        <p className={styles.description}>
          Optimización de rutas, itinerarios personalizados y acceso offline con
          tecnología IA.
        </p>
        <div className={styles.actions}>
          <InstallButton
            style={["primary", "big"]}
            fallback={<Button style={["primary", "big"]} label="Comenzar ahora" to={user ? "/dashboard" : "/signup"} />}
          />
          <DemoButton style="secondary" />
        </div>
      </div>
    </section>
  );
}
