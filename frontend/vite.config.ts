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
                globPatterns: ["**/*.{js,css,html,ico,png,svg,webmanifest}"],
                maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
                navigateFallback: "/index.html",
                navigateFallbackDenylist: [/^\/api\//, /^\/ws\//],
                runtimeCaching: [
                    {
                        urlPattern: ({ url }) =>
                            url.origin === "https://fonts.googleapis.com",
                        handler: "StaleWhileRevalidate",
                        options: {
                            cacheName: "google-fonts-stylesheets",
                        },
                    },
                    {
                        urlPattern: ({ url }) =>
                            url.origin === "https://fonts.gstatic.com",
                        handler: "CacheFirst",
                        options: {
                            cacheName: "google-fonts-webfonts",
                            expiration: {
                                maxEntries: 20,
                                maxAgeSeconds: 60 * 60 * 24 * 365,
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
                description: "Planifica tus viajes del futuro",
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
