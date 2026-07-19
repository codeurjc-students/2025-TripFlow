import styles from "@styles/pages/Help.module.css";

import { useState } from "react";

import { FAQ_CATEGORIES } from "@/constants/faqs";

import Layout from "@/layouts/Layout";
import AccordionItem from "@/components/shared/Accordion";
import Badge from "@/components/shared/Badge";

import { CircleHelpIcon } from "lucide-react";

import { useSeo } from "@/hooks/useSeo";

export default function HelpPage() {
    useSeo(
        "Ayuda y preguntas frecuentes | TripFlow",
        "Resuelve tus dudas sobre TripFlow: itinerarios con IA, rutas, colaboración y modo offline. Preguntas frecuentes y guías de uso."
    );

    const [openId, setOpenId] = useState<string | null>("0-0");

    const toggleAccordion = (categoryId: number, itemId: number) => {
        const id = `${categoryId}-${itemId}`;
        setOpenId(openId === id ? null : id);
    };

    return (
        <Layout>
            <div className={styles.container}>
                <section className={styles.section}>
                    <div className={styles.headerBlock}>
                        <div className={styles.headerTopRow}>
                            <h2 className={styles.sectionTitle}>Preguntas Frecuentes</h2>
                            <div className={styles.helpChip}>
                                <Badge style="default">
                                    <>
                                        <CircleHelpIcon size={16} />
                                        Centro de ayuda
                                    </>
                                </Badge>
                            </div>
                        </div>
                        <p className={styles.sectionDescription}>
                            Encuentra respuestas rápidas sobre cuentas, itinerarios, colaboración y uso diario de TripFlow.
                        </p>
                    </div>
                    <div className={styles.faqWrapper}>
                        {FAQ_CATEGORIES.map((category, catIndex) => (
                            <div key={catIndex} className={styles.categorySection}>
                                <div className={styles.categoryHeader}>
                                    <h3 className={styles.categoryTitle}>{category.title}</h3>
                                    <span className={styles.categoryCount}>
                                        {category.items.length} preguntas
                                    </span>
                                </div>
                                <div className={styles.categoryItems}>
                                    {category.items.map((faq, itemIndex) => (
                                        <AccordionItem
                                            key={itemIndex}
                                            title={faq.question}
                                            isOpen={openId === `${catIndex}-${itemIndex}`}
                                            onToggle={() => toggleAccordion(catIndex, itemIndex)}
                                        >
                                            <p>{faq.answer}</p>
                                        </AccordionItem>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <p className={styles.legalNote}>
                        Al usar TripFlow aceptas nuestra <a href="/privacy">Política de Privacidad</a>.
                    </p>
                </section>
            </div>
        </Layout>
    );
}
