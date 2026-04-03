import styles from "@styles/components/sections/Faq.module.css";

import { useState } from "react";

import { FAQ_CATEGORIES } from "@/constants/faqs";

import Section from "@components/shared/Section";
import AccordionItem from "@/components/shared/Accordion";
import Button from "@components/shared/Button";

// Use only General FAQs for the landing page
const FAQ_DATA = FAQ_CATEGORIES.find(cat => cat.title === "General")?.items || [];

export default function Faq() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const toggleAccordion = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <Section title={<>Preguntas Frecuentes</>}>
            <div className={styles.faq}>
                {FAQ_DATA.map((item, index) => (
                    <AccordionItem
                        key={index}
                        title={item.question}
                        isOpen={openIndex === index}
                        onToggle={() => toggleAccordion(index)}
                    >
                        <p className={styles.faqAnswer}>{item.answer}</p>
                    </AccordionItem>
                ))}
            </div>
            <Button
                style={["secondary"]}
                label="Quiero saber más"
                to="/help"
            />
        </Section>
    );
}
