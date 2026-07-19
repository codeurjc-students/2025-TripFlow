import { useEffect } from "react";

const SITE_ORIGIN = "https://tripflow.cub1z.es";

/**
 * Sets per-route SEO tags by mutating the ones already in index.html (single
 * source, no duplicates) so Googlebot and the prerender step pick them up.
 */
export function useSeo(title: string, description?: string) {
    useEffect(() => {
        const setContent = (selector: string, value: string) => {
            document.head.querySelector(selector)?.setAttribute("content", value);
        };

        const prevTitle = document.title;
        document.title = title;
        setContent('meta[property="og:title"]', title);
        setContent('meta[name="twitter:title"]', title);

        if (description) {
            setContent('meta[name="description"]', description);
            setContent('meta[property="og:description"]', description);
            setContent('meta[name="twitter:description"]', description);
        }

        // pathname is correct even under prerender (only the origin is localhost).
        const url = SITE_ORIGIN + window.location.pathname;
        setContent('meta[property="og:url"]', url);
        document.head.querySelector('link[rel="canonical"]')?.setAttribute("href", url);

        return () => {
            document.title = prevTitle;
        };
    }, [title, description]);
}
