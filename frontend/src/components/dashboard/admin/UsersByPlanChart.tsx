import styles from "@styles/pages/Admin.module.css";

import { useEffect, useMemo, useState } from "react";

import type { UsersByPlanItem } from "@/types/stats";
import { getUsersByPlanStats } from "@/services/statsService";

type PlanDatum = {
    key: string;
    plan: string;
    count: number;
    widthPercent: number;
};

function normalizePlanLabel(plan: string): string {
    if (plan === "FREE") return "Free";
    if (plan === "PRO") return "Pro";
    if (plan === "PREMIUM") return "Premium";
    return plan;
}

function mapToBars(items: UsersByPlanItem[]): PlanDatum[] {
    const maxCount = items.reduce((max, item) => Math.max(max, item.count), 0);
    const safeMax = maxCount > 0 ? maxCount : 1;

    return items
        .map((item) => ({
            key: item.plan,
            plan: normalizePlanLabel(item.plan),
            count: item.count,
            widthPercent: item.count === 0
                ? 0
                : Math.max(8, Math.round((item.count * 100) / safeMax)),
        }))
        .sort((a, b) => {
            const planOrder: Record<string, number> = { FREE: 0, PRO: 1, PREMIUM: 2 };
            return (planOrder[a.key] ?? 99) - (planOrder[b.key] ?? 99);
        });
}

export default function UsersByPlanChart() {
    const [items, setItems] = useState<UsersByPlanItem[]>([]);

    useEffect(() => {
        let mounted = true;

        async function load() {
            try {
                const response = await getUsersByPlanStats();
                if (mounted) {
                    setItems(response.items ?? []);
                }
            } catch {
                if (mounted) {
                    setItems([]);
                }
            }
        }

        load();

        return () => {
            mounted = false;
        };
    }, []);

    const bars = useMemo(() => mapToBars(items), [items]);

    if (bars.length === 0) {
        return null;
    }

    return (
        <section className={styles.planChartCard} aria-label="Distribucion de usuarios por plan">
            <div className={styles.planChartInner}>
                <div className={styles.planChartHeader}>
                    <h3>Usuarios por plan</h3>
                    <p>Vista rápida para administración</p>
                </div>
                <div className={styles.planChartBody}>
                    {bars.map((bar) => (
                        <div key={bar.key} className={styles.planChartRow}>
                            <span className={styles.planLabel}>{bar.plan}</span>
                            <div className={styles.planTrack}>
                                <div className={styles.planFill} style={{ width: `${bar.widthPercent}%` }} />
                            </div>
                            <span className={styles.planCount}>{bar.count}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
