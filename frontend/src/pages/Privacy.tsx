import styles from "@styles/pages/Privacy.module.css";

import Layout from "@/layouts/Layout";
import Badge from "@/components/shared/Badge";

import { ShieldCheckIcon } from "lucide-react";

import { useSeo } from "@/hooks/useSeo";

const LAST_UPDATE = "13 de abril de 2026";

const PRIVACY_SECTIONS = [
    {
        title: "1. Responsable del tratamiento",
        paragraphs: [
            "TripFlow es responsable del tratamiento de los datos personales recopilados a través de esta plataforma para prestar servicios de planificación, colaboración y seguimiento de itinerarios de viaje.",
            "Para consultas sobre privacidad puedes usar los canales de soporte disponibles dentro de la plataforma.",
        ],
    },
    {
        title: "2. Datos que recopilamos",
        paragraphs: [
            "Recopilamos información de registro como nombre, correo electrónico y credenciales cifradas. También podemos almacenar preferencias de viaje, itinerarios, ubicaciones agregadas por ti, configuraciones de cuenta y metadatos técnicos de uso.",
            "Si habilitas funciones colaborativas, guardamos la relación entre participantes, roles y acciones sobre el contenido compartido para mantener trazabilidad y seguridad.",
        ],
    },
    {
        title: "3. Finalidades del tratamiento",
        paragraphs: [
            "Usamos tus datos para crear y administrar tu cuenta, sincronizar itinerarios, enviar notificaciones relacionadas con el servicio, resolver incidencias y mejorar el rendimiento de la aplicación.",
            "También tratamos información técnica para prevenir fraude, abusos, accesos no autorizados y para cumplir obligaciones legales aplicables.",
        ],
    },
    {
        title: "4. Base legal y conservación",
        paragraphs: [
            "La base legal principal es la ejecución del servicio solicitado y, cuando corresponde, tu consentimiento para funciones opcionales.",
            "Conservamos los datos mientras la cuenta permanezca activa o durante los plazos necesarios para cumplir obligaciones legales, resolver disputas y proteger nuestros derechos.",
        ],
    },
    {
        title: "5. Compartición de datos",
        paragraphs: [
            "No vendemos tus datos personales. Solo compartimos información con proveedores que prestan servicios esenciales (alojamiento, notificaciones, analítica operativa) bajo acuerdos de confidencialidad y seguridad.",
            "Podemos revelar datos cuando exista una obligación legal válida o para proteger la seguridad de la plataforma y de sus usuarios.",
        ],
    },
    {
        title: "6. Tus derechos",
        paragraphs: [
            "Puedes solicitar acceso, rectificación, supresión, oposición, limitación del tratamiento y portabilidad de tus datos, de acuerdo con la normativa aplicable.",
            "También puedes retirar tu consentimiento para tratamientos opcionales en cualquier momento, sin afectar la licitud del tratamiento previo.",
        ],
    },
    {
        title: "7. Seguridad",
        paragraphs: [
            "Aplicamos medidas técnicas y organizativas razonables para proteger la confidencialidad, integridad y disponibilidad de la información.",
            "Aunque ningún sistema es completamente infalible, trabajamos de forma continua para reducir riesgos y responder rápidamente ante incidentes.",
        ],
    },
    {
        title: "8. Cookies y tecnologías similares",
        paragraphs: [
            "Utilizamos cookies y almacenamiento local para autenticar sesiones, recordar preferencias y mejorar la experiencia de uso.",
            "Puedes gestionar estas tecnologías desde la configuración de tu navegador. Algunas funciones pueden verse limitadas si las desactivas.",
        ],
    },
    {
        title: "9. Cambios en esta política",
        paragraphs: [
            "Podemos actualizar esta Política de Privacidad para reflejar mejoras del servicio o cambios normativos. Publicaremos la fecha de última actualización en esta misma página.",
            "Si los cambios son relevantes, te lo comunicaremos por los canales disponibles en la plataforma.",
        ],
    },
];

export default function PrivacyPage() {
    useSeo(
        "Política de privacidad | TripFlow",
        "Cómo TripFlow trata y protege tus datos personales: qué recopilamos, para qué y tus derechos."
    );

    return (
        <Layout>
            <div className={styles.container}>
                <section className={styles.section} aria-labelledby="privacy-title">
                    <div className={styles.headerBlock}>
                        <div className={styles.headerTopRow}>
                            <h2 className={styles.sectionTitle}>
                                Política de Privacidad
                            </h2>
                            <div className={styles.privacyChip}>
                                <Badge style="default">
                                    <>
                                        <ShieldCheckIcon size={16} />
                                        Protección de datos
                                    </>
                                </Badge>
                            </div>
                        </div>
                        <p className={styles.sectionDescription}>
                            Esta política explica qué datos tratamos, por qué los necesitamos y qué opciones tienes
                            para controlar tu información dentro de TripFlow.
                        </p>
                        <p className={styles.lastUpdate}>Última actualización: {LAST_UPDATE}</p>
                    </div>

                    <div className={styles.contentBlocks}>
                        {PRIVACY_SECTIONS.map((section) => (
                            <article key={section.title} className={styles.contentCard}>
                                <h2 className={styles.cardTitle}>{section.title}</h2>
                                <div className={styles.cardBody}>
                                    {section.paragraphs.map((paragraph) => (
                                        <p key={paragraph}>{paragraph}</p>
                                    ))}
                                </div>
                            </article>
                        ))}
                    </div>
                </section>
            </div>
        </Layout>
    );
}
