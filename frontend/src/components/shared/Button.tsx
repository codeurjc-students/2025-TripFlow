import styles from "@styles/components/shared/Button.module.css";

import { NavLink } from "react-router";

type ButtonStyle = "primary" | "secondary" | "inline" | "tool" | "tool_bordered" | "bordered" | "logo"
    | "route" | "active" | "danger" | "info" | "wrap" | "rounded" | "big" | "full" | "float";
type Target = "_blank" | "_self" | "_parent" | "_top";
type Rel = "noopener noreferrer" | "nofollow" | "noopener" | "noreferrer";

interface ButtonProps {
    style: ButtonStyle[];
    size?: "default" | "small";
    id?: string;
    label?: string;
    type?: "button" | "submit" | "reset";
    onClick?: (e?: React.MouseEvent) => void;
    to?: string;
    target?: Target;
    rel?: Rel;
    ariaLabel?: string;
    disabled?: boolean;
    noGap?: boolean;
    children?: React.ReactNode;
}

/**
 * Button component for rendering unified styled buttons or links.
 */
export default function Button({ id, label, onClick, style, size = "default", type, to, target, rel, ariaLabel, disabled, children, noGap }: ButtonProps) {
    let customStyles = `${styles.button}` + (children && label && !noGap ? ` ${styles.withChildren}` : ``);
    style.map(s => customStyles += ` ${styles[s]}`);
    if (size === "small") customStyles += ` ${styles.small}`;

    const body = (
        <>
            {children}
            {label && <span className={styles.label}>{label}</span>}
        </>
    )

    if (to) return <NavLink id={id} to={to} className={customStyles} target={target} rel={rel} aria-label={ariaLabel}>{body}</NavLink>;
    else return <button id={id} className={customStyles} type={type} onClick={onClick} aria-label={ariaLabel} disabled={disabled}>{body}</button>;
}
