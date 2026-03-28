import styles from "@styles/components/shared/AttributionImage.module.css";
import { ImageOff } from "lucide-react";
import { useEffect, useState, type ComponentProps } from "react";

interface AttributionImageProps extends ComponentProps<"div"> {
  src: string;
  alt: string;
  attribution: string;
  attributionLink: string;
  attributionPrefix?: string;
  loading?: "eager" | "lazy";
}

export default function AttributionImage({
  src,
  alt,
  attribution,
  attributionLink,
  attributionPrefix = "Foto de ",
  loading = "lazy",
  className,
  children,
  ...props
}: AttributionImageProps) {
  const [hasLoadError, setHasLoadError] = useState(false);

  useEffect(() => {
    setHasLoadError(false);
  }, [src]);

  return (
    <div className={`${styles.container} ${className || ""}`} {...props}>
      {!hasLoadError ? (
        <img
          className={styles.image}
          src={src}
          alt={alt}
          decoding="async"
          loading={loading}
          onError={() => setHasLoadError(true)}
        />
      ) : (
        <div className={styles.fallbackTemplate} role="img" aria-label={alt || "Imagen no disponible"}>
          <ImageOff size={22} />
          <span>Imagen no disponible sin conexion</span>
        </div>
      )}

      {children}

      <div className={`${styles.overlay} ${hasLoadError ? styles.overlayVisible : ""}`}>
        <span>{attributionPrefix}</span>
        <span
          className={styles.authorLink}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            window.open(attributionLink, "_blank", "noopener,noreferrer");
          }}
        >
          {attribution}
        </span>
      </div>
    </div>
  );
}