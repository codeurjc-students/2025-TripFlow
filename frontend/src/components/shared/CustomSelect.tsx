import styles from "@styles/components/shared/CustomSelect.module.css";

import type { ReactNode } from "react";
import type { ContextMenuItem } from "@components/shared/ContextMenu";

import { ChevronDown } from "lucide-react";

import ContextMenu from "@components/shared/ContextMenu";

export interface Option {
    label: ReactNode;
    value: string;
    icon?: ReactNode;
}

export interface CustomSelectProps {
    value: string;
    onChange: (value: string) => void;
    options: Option[];
    placeholder?: string;
    className?: string;
}

export default function CustomSelect({ value, onChange, options, placeholder, className }: CustomSelectProps) {
    const selectedOption = options.find((opt) => opt.value === value);

    const menuItems: ContextMenuItem[] = options.map((opt) => ({
        label: opt.label,
        icon: opt.icon,
        onClick: () => onChange(opt.value),
    }));

    return (
        <ContextMenu
            className={className}
            items={menuItems}
            triggerStyle={["bordered", "full"]}
            trigger={
                <div className={styles.triggerContent}>
                    <span className={styles.label}>
                        {selectedOption ? selectedOption.label : placeholder || "Seleccionar..."}
                    </span>
                    <ChevronDown size={16} className={styles.chevron} />
                </div>
            }
        />
    );
}
