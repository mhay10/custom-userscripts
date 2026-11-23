import { defineConfig } from "vite";
import { resolve } from "path";
import { fileURLToPath } from "url";
import userscript from "vite-userscript-plugin";
import pkg from "./package.json" with { type: "json" };

const __dirname = resolve(fileURLToPath(import.meta.url), "..");

export default defineConfig({
    build: {
        outDir: "dist",
        lib: {
            entry: resolve(__dirname, "src/main.ts"),
            name: "ScryfallDarkMode",
            fileName: "scryfall-dark-mode.user",
            formats: ["iife"],
        },
        rollupOptions: {
            output: {
                entryFileNames: "scryfall-dark-mode.user.js",
                chunkFileNames: "[name].js",
            },
        },
    },
    plugins: [
        userscript({
            entry: "src/main.ts",
            header: {
                // Userscript Details
                name: "Scryfall Dark Mode",
                version: pkg.version,
                description: "Dark mode for Scryfall on every page",
                author: "mhay10",
                icon: "https://www.google.com/s2/favicons?sz=64&domain=scryfall.com",

                // Homepage/Version Info
                homepage: "https://github.com/mhay10/custom-userscripts",
                downloadURL:
                    "https://github.com/mhay10/custom-userscripts/releases/latest/download/Scryfall-Dark-Mode.user.js",
                updateURL:
                    "https://github.com/mhay10/custom-userscripts/releases/latest/download/Scryfall-Dark-Mode.meta.js",

                // Userscript Permissions
                match: "https://scryfall.com/*",
                "run-at": "document-start",
            },
        }),
    ],
});
