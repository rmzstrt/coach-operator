import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      includeAssets: ["icon.svg", "apple-touch-icon.png"],
      manifest: {
        name: "ArcScore — Suivi de scores",
        short_name: "ArcScore",
        description: "Suivi de scores de tir à l'arc, séance après séance.",
        theme_color: "#1e3a5f",
        background_color: "#0f2138",
        display: "standalone",
        start_url: "/",
        scope: "/",
        lang: "fr",
        icons: [
          { src: "pwa-192.png", sizes: "192x192", type: "image/png" },
          { src: "pwa-512.png", sizes: "512x512", type: "image/png" },
          {
            src: "maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,ico}"],
      },
      // Le service worker n'est activé qu'en production (npm run build && npm run preview) :
      // l'enregistrer en dev pose des soucis dans certains environnements de preview.
      devOptions: {
        enabled: false,
      },
    }),
  ],
});
