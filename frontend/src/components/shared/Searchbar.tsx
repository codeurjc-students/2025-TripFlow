import styles from "@styles/components/shared/Searchbar.module.css";

import { SearchIcon, XIcon } from "lucide-react";

interface SearchbarProps {
    placeHolder: string;
    onInputChange: (value: string) => void;
    onSearch?: () => void;
    value?: string;
    onClear?: () => void;
    ariaLabel?: string;
}

export default function Searchbar({
    placeHolder,
    onInputChange,
    onSearch,
    value,
    onClear,
    ariaLabel,
}: SearchbarProps) {
    const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        onSearch?.();
    };

    return (
        <form className={styles.searchbar} onSubmit={handleSearch}>
            <button type="submit" className={styles.button}>
                <SearchIcon size={20} />
            </button>
            <input
                id="search-input"
                type="text"
                placeholder={placeHolder}
                className={styles.input}
                value={value}
                onChange={(e) => onInputChange(e.target.value)}
                aria-label={ariaLabel ?? placeHolder}
            />
            {onClear && value && value.trim().length > 0 && (
                <button
                    type="button"
                    className={styles.clearButton}
                    onClick={onClear}
                    aria-label="Limpiar búsqueda"
                >
                    <XIcon size={16} />
                </button>
            )}
        </form>
    );
}
