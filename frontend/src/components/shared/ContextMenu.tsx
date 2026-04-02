import styles from "@styles/components/shared/ContextMenu.module.css";

import { useRef, useState, useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { useClickOutside } from "@/hooks/useClickOutside";

import { MoreVertical } from "lucide-react";

import Button from "@components/shared/Button";

export interface ContextMenuItem {
    label: ReactNode;
    icon?: ReactNode;
    onClick: () => void;
    danger?: boolean;
    disabled?: boolean;
}

interface ContextMenuProps {
    items: ContextMenuItem[];
    trigger?: ReactNode;
    triggerStyle?: any[];
    className?: string;
    disabled?: boolean;
    triggerId?: string;
}

/**
 * A highly reusable and responsive ContextMenu component.
 * Uses React Portals for positioning to avoid clipping by parent containers.
 */
export default function ContextMenu({ items, trigger, triggerStyle, className, disabled = false, triggerId }: ContextMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});
    
    const containerRef = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close when clicking outside
    useClickOutside<HTMLDivElement>(menuRef, (e) => {
        if (!containerRef.current?.contains(e.target as Node)) {
            setIsOpen(false);
        }
    });

    /**
     * Calculates the best position for the menu relative to the trigger.
     * Prevents the menu from overflowing the viewport.
     */
    const updatePosition = () => {
        if (!isOpen || !containerRef.current || !menuRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const menuRect = menuRef.current.getBoundingClientRect();
        const viewportPadding = 8;
        const verticalOffset = 4;
        
        // Fallback dimensions for initial render if rect is zero
        const menuWidth = menuRect.width || 180;
        const menuHeight = menuRect.height || 120;
        
        const spaceOnBottom = window.innerHeight - rect.bottom;

        const newStyle: React.CSSProperties = { position: "fixed" };

        // Vertical positioning (flip to top when there is no room below).
        const canOpenUp = rect.top >= menuHeight + viewportPadding;
        if (spaceOnBottom < menuHeight + viewportPadding && canOpenUp) {
            const top = Math.max(viewportPadding, rect.top - menuHeight - verticalOffset);
            newStyle.top = `${top}px`;
        } else {
            const top = Math.min(
                rect.bottom + verticalOffset,
                window.innerHeight - menuHeight - viewportPadding
            );
            newStyle.top = `${Math.max(viewportPadding, top)}px`;
        }

        // Horizontal positioning (keep menu fully inside viewport).
        const preferredLeft = rect.right - menuWidth;
        const maxLeft = window.innerWidth - menuWidth - viewportPadding;
        const left = Math.min(Math.max(viewportPadding, preferredLeft), maxLeft);
        newStyle.left = `${Math.max(viewportPadding, left)}px`;

        setMenuStyle(newStyle);
    };

    // Update position on state change or window events
    useEffect(() => {
        if (!isOpen) return;

        updatePosition();
        window.addEventListener("scroll", updatePosition, true);
        window.addEventListener("resize", updatePosition);

        return () => {
            window.removeEventListener("scroll", updatePosition, true);
            window.removeEventListener("resize", updatePosition);
        };
    }, [isOpen]);

    // Re-calculate position whenever the menu DOM changes
    useEffect(() => {
        if (isOpen) updatePosition();
    }, [isOpen, menuRef.current]);

    const buttonStyles = [
        isOpen ? "active" : "",
        ...(triggerStyle || ["tool_bordered"]),
    ];

    return (
        <div className={`${styles.container} ${className || ""}`} ref={containerRef}>
            <Button
                type="button"
                style={buttonStyles}
                onClick={(e: any) => {
                    e.stopPropagation();
                    if (disabled) return;
                    setIsOpen(!isOpen);
                }}
                aria-haspopup="menu"
                aria-expanded={isOpen}
                id={triggerId}
                disabled={disabled}
            >
                {trigger || <MoreVertical size={16} strokeWidth={2.5} />}
            </Button>

            {isOpen && createPortal(
                <div 
                    ref={menuRef}
                    role="menu" 
                    className={styles.menu} 
                    style={menuStyle}
                >
                    {items.map((item, index) => (
                        <ContextMenuItem 
                            key={index} 
                            item={item} 
                            onClose={() => setIsOpen(false)} 
                        />
                    ))}
                </div>,
                document.body
            )}
        </div>
    );
}

/**
 * Internal component for menu items to keep the main component clean.
 */
function ContextMenuItem({ item, onClose }: { item: ContextMenuItem; onClose: () => void }) {
    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (item.disabled) return;
        
        item.onClick();
        onClose();
    };

    return (
        <button
            role="menuitem"
            className={`${styles.menuItem} ${item.danger ? styles.danger : ""}`}
            onClick={handleClick}
            disabled={item.disabled}
        >
            {item.icon && <span className={styles.icon}>{item.icon}</span>}
            <span className={styles.label}>{item.label}</span>
        </button>
    );
}
