/// <reference types="vitest" />

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
    base: "/",
    envPrefix: "PUBLIC_",
    plugins: [
        react(),
        VitePWA({
            registerType: "autoUpdate",
            workbox: {
                globPatterns: ["**/*.{js,css,html,ico,png,svg,webp,woff2,webmanifest}"],
                globIgnores: ["**/screenshots/**"], // only used by the browser install dialog, not offline

                maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
                navigateFallback: "/index.html",
                navigateFallbackDenylist: [/^\/api\//, /^\/ws\//],
                runtimeCaching: [
                    {
                        urlPattern: ({ url }) =>
                            url.hostname === "images.unsplash.com" ||
                            url.hostname === "source.unsplash.com" ||
                            url.hostname === "plus.unsplash.com",
                        handler: "CacheFirst",
                        options: {
                            cacheName: "unsplash-images",
                            cacheableResponse: {
                                statuses: [0, 200],
                            },
                            expiration: {
                                maxEntries: 200,
                                maxAgeSeconds: 60 * 60 * 24 * 30,
                            },
                        },
                    },
                ],
                cleanupOutdatedCaches: true,
                skipWaiting: true,
                clientsClaim: true,
            },
            manifest: {
                name: "TripFlow",
                short_name: "TripFlow",
                description:
                    "Planifica tus viajes con itinerarios personalizados por IA. " +
                    "Optimiza rutas, organiza actividades y colabora en tiempo real, " +
                    "también sin conexión.",
                theme_color: "#101922",
                background_color: "#101922",
                display: "standalone",
                scope: "/",
                start_url: "/dashboard",
                orientation: "portrait",
                icons: [
                    {
                        src: "icons/icon-192x192.png",
                        sizes: "192x192",
                        type: "image/png",
                        purpose: "any maskable",
                    },
                    {
                        src: "icons/icon-512x512.png",
                        sizes: "512x512",
                        type: "image/png",
                        purpose: "any maskable",
                    },
                ],
                screenshots: [
                    {
                        src: "screenshots/showcase.png",
                        sizes: "1920x1080",
                        type: "image/png",
                        form_factor: "wide",
                        label: "Planifica y organiza tus viajes con TripFlow",
                    },
                    {
                        src: "screenshots/showcase-mobile-1.png",
                        sizes: "453x912",
                        type: "image/png",
                        form_factor: "narrow",
                        label: "Tu panel de viajes",
                    },
                    {
                        src: "screenshots/showcase-mobile-2.png",
                        sizes: "453x912",
                        type: "image/png",
                        form_factor: "narrow",
                        label: "El detalle de cada itinerario",
                    },
                ],
            },
        }),
    ],
    publicDir: "public",
    server: {
        host: process.env.VITE_HOST || "localhost",
        port: 5173,
        strictPort: true,
    },
    preview: {
        host: "0.0.0.0",
        port: 4173,
        strictPort: true,
    },
    build: {
        outDir: "dist",
    },
    test: {
        globals: true,
        environment: "jsdom",
        setupFiles: "./src/setupTests.ts",
        include: ["src/**/*.test.{ts,tsx}", "tests/**/*.test.{ts,tsx}"],
    },
    resolve: {
        alias: {
            "@": "/src",
            "@components": "/src/components",
            "@services": "/src/services",
            "@pages": "/src/pages",
            "@styles": "/src/styles",
            "@tests": "/tests",
        },
    },
});
