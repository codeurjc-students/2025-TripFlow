import styles from "@styles/components/sections/Guide.module.css";

import Section from "@components/shared/Section";

export default function Guide() {
  return (
    <Section
      title={
        <>
          Instala TripFlow en tu <strong>Móvil</strong>
        </>
      }
    >
      <div className={styles.guide}>
        <div className={styles.content}>
          <p className={styles.p}>
            Si quieres disfrutar de todas las ventajas que ofrece TripFlow,
            descarga nuestra aplicación PWA.
          </p>
          <p className={styles.p}>
            Es fácil de instalar, rápida, funciona sin conexión y está
            disponible tanto para móviles como para ordenadores.
          </p>
          <h3 className={styles.subtitle}>¿Cómo la puedo instalar?</h3>
          <ol>
            <li className={styles.text}>
              Abre TripFlow en tu navegador (Chrome, Edge o Firefox).
            </li>
            <li className={styles.text}>
              Busca el icono de <strong>"Añadir a pantalla de inicio"</strong> o{" "}
              <strong>"Instalar app"</strong> en el menú del navegador.
            </li>
            <li className={styles.text}>
              Sigue las instrucciones para añadir TripFlow a tu dispositivo.
            </li>
            <li className={styles.text}>
              ¡Listo! Accede rápido y sin conexión cuando quieras.
            </li>
          </ol>
        </div>
        <div className={styles.guideImage}>
          <div className={styles.imageContainer}>
            <img
              src="/assets/mobile_showcase.webp"
              alt="Mobile TripFlow showcase app"
              className={styles.image}
            />
          </div>
        </div>
      </div>
    </Section>
  );
}
