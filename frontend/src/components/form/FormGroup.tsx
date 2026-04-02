import styles from "@styles/components/form/Form.module.css";

import CustomSelect from "@/components/shared/CustomSelect";

export type Field = {
    name: string;
    label?: string;
    placeholder?: string;
    type?: "text" | "password" | "email" | "time" | "textarea" | "number" | "date" | "select";
    value?: string | number;
    disabled?: boolean;
    options?: { value: string | number; label: string }[];
    required?: boolean;
    min?: string | number;
    max?: string | number;
    step?: string | number;
    icon?: React.ReactNode;
};

export default function FormGroup({ field, index, handleChange, errors, fullWidth }: {
    field: Field;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    index?: number;
    errors?: { [key: string]: string };
    fullWidth?: boolean;
}) {

    const renderInput = () => {
        const hasLeadingIcon = Boolean(field.icon);
        const inputClassName = hasLeadingIcon ? styles.inputWithIcon : "";
        const isSelectField = field.type === "select";
        const selectClassName = hasLeadingIcon ? styles.selectWithIcon : "";
        const baseProps = {
            id: field.name,
            disabled: field.disabled,
            name: field.name,
            placeholder: field.placeholder || "",
            value: field.value || "",
            onChange: handleChange,
            className: inputClassName,
        }

        let inputElement;

        if (field.type === "textarea") {
            inputElement = <textarea {...baseProps} />;
        } else if (field.type === "number" || field.type === "date" || field.type === "time") {
            inputElement = <input {...baseProps} type={field.type} min={field.min} max={field.max} step={field.step} />;
        } else if (field.type === "select") {
            const selectValue = String(field.value ?? "");
            inputElement = (
                <CustomSelect
                    id={field.name}
                    className={selectClassName}
                    value={selectValue}
                    disabled={field.disabled}
                    leadingIcon={field.icon}
                    onChange={(nextValue) => handleChange({
                        target: {
                            name: field.name,
                            value: nextValue,
                        },
                    } as React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>)}
                    options={(field.options || []).map((option) => ({
                        value: String(option.value),
                        label: option.label,
                    }))}
                    placeholder={field.placeholder || "Seleccionar..."}
                />
            );
        } else {
            inputElement = <input {...baseProps} type={field.type || "text"} />;
        }

        return (
            <div className={styles.inputWrapper}>
                {inputElement}
                {field.icon && !isSelectField && (
                    <div className={styles.inputIcon}>
                        {field.icon}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div
            key={`${field.name}-${index}`}
            className={`${styles.field} ${fullWidth ? styles.fullWidth : ""}`}
        >
            {field.label && (
                <label className={styles.fieldLabel} htmlFor={field.name}>
                    <span className={styles.fieldLabelText}>{field.label}</span>
                    {field.required && <span className={styles.required}>*</span>}
                </label>
            )}


            {renderInput()}

            {errors && errors[field.name] && (
                <div className={styles.error}>
                    {errors[field.name]}
                </div>
            )}
        </div>
    );
}
