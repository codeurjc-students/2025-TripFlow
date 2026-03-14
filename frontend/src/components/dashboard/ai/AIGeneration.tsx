import styles from "@styles/components/dashboard/ai/AIGeneration.module.css";

import { useEffect, useState } from "react";

import type { AIUsage } from "@/types/ai";

import { generateItinerary, getAIStatus } from "@/services/aiService";
import { useDemo } from "@/providers/demoProvider";
import { useAuth } from "@/providers/authProvider";
import { useNotification } from "@/providers/notificationProvider";
import { useAIGenerationForm } from "@/hooks/useAIGenerationForm";
import { suggestions } from "@/utils/aiSuggestions";

import { Send, Package, PackageOpen, Loader } from "lucide-react";

import FormGroup from "@components/form/FormGroup";
import Button from "@components/shared/Button";
import TagsSection from "@/components/dashboard/TagsSection";
import Badge from "@components/shared/Badge";
import { useWebSocketNotifications } from "@/hooks/notifications/useWebSocketNotifications";

export default function AIGeneration() {
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [rateLimit, setRateLimit] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [aiUsage, setAiUsage] = useState<AIUsage | null>(null);

    const { demo } = useDemo();
    const { user } = useAuth();
    const { notify } = useNotification();
    const { form, handleChange, handleInterestsChange, resetForm, updateField, advancedFields } = useAIGenerationForm();

    const handleSuggestionClick = (text: string) => {
        updateField("aiPrompt", text);
    };

    const handleAIStatusChange = async () => {
        const status = await getAIStatus();
        setRateLimit(!status.canUseAI);
        setIsLoading(status.isProcessing);
        setAiUsage({
            usedQuota: status.dailyLimit - status.remainingRequests,
            remainingQuota: status.remainingRequests,
            limit: status.dailyLimit,
            resetDate: "Mañana"
        })
    }

    useEffect(() => {
        handleAIStatusChange();
    }, []);

    useWebSocketNotifications({
        types: ["ITINERARY_GENERATED", "ITINERARY_GENERATION_FAILED"],
        onNotification: (_) => {
            handleAIStatusChange();
        }
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await generateItinerary(form);

            if (response?.aiUsage) {
                setAiUsage(response.aiUsage);
            }

            resetForm();

            // Handle rate limit
            if (!response || !response.aiUsage) {
                setRateLimit(true);
                setIsLoading(false);
                notify("Has alcanzado el límite diario de generaciones.", "error", {
                    title: "Límite diario alcanzado"
                });
                return;
            }

            notify("Tu solicitud se está procesando.", "success", {
                title: "Solicitud recibida!"
            });

            setRateLimit(false);
        } catch {
            setIsLoading(false);
            notify("Error al generar el itinerario. Inténtalo de nuevo.", "error");
        }
    };

    return (
        <section className={styles.aiGenerationSection}>
            <h2 className={styles.title}>Tu Asistente de Viajes</h2>

            <div className={styles.suggestions}>
                {suggestions.map((suggestion) => (
                    <button
                        key={suggestion.label}
                        type="button"
                        className={styles.suggestionChip}
                        onClick={() => handleSuggestionClick(suggestion.text)}
                    >
                        {suggestion.icon}
                        {suggestion.label}
                    </button>
                ))}
            </div>

            <form className={styles.gptForm} onSubmit={handleSubmit}>
                <div className={styles.promptSection}>
                    <FormGroup
                        field={{
                            type: "textarea",
                            disabled: isLoading || rateLimit,
                            name: "aiPrompt",
                            value: form.aiPrompt,
                            placeholder: "Escribe tu solicitud aquí..."
                        }}
                        index={-1}
                        handleChange={handleChange}
                        fullWidth
                    />
                </div>

                <button
                    type="button"
                    className={styles.toggleAdvanced}
                    onClick={() => setShowAdvanced(!showAdvanced)}
                >
                    {showAdvanced ? <PackageOpen size={16} /> : <Package size={16} />}
                    {showAdvanced ? "Ocultar opciones avanzadas" : "Mostrar opciones avanzadas"}
                </button>

                {showAdvanced && (
                    <div className={styles.advancedOptions}>
                        <div className={styles.formGrid}>
                            {advancedFields.map((field) => (
                                <FormGroup
                                    key={field.name}
                                    field={field}
                                    handleChange={handleChange}
                                    fullWidth
                                />
                            ))}
                        </div>

                        <div className={styles.tagsContainer}>
                            <TagsSection
                                tags={form.interests}
                                onTagsChange={handleInterestsChange}
                                label="Intereses"
                                placeholder="Ej: Torre Eiffel, Louvre, Montmartre..."
                            />
                        </div>
                    </div>
                )}

                <div className={styles.gptFooter}>
                    {(user?.plan === "FREE" || user?.plan === "PRO") && aiUsage
                        ? (
                            <Badge
                                style="default"
                                title={`Restantes: ${aiUsage.remainingQuota}/${aiUsage.limit}`}
                                status={aiUsage.usedQuota === aiUsage.limit ? "CANCELLED" : "ONGOING"}
                            />
                        )
                        : <span></span>
                    }

                    <Button
                        label={isLoading ? "Generando..." : "Generar"}
                        disabled={isLoading || rateLimit || demo}
                        style={["primary"]}
                        type="submit"
                    >
                        {isLoading ? <Loader size={18} /> : <Send size={18} />}
                    </Button>
                </div>
            </form>
        </section>
    );
}