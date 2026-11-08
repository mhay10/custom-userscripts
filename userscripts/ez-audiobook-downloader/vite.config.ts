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
            name: "EzAudiobookDownloader",
            fileName: "ez-audiobook-downloader.user",
            formats: ["iife"],
        },
        rollupOptions: {
            output: {
                entryFileNames: "ez-audiobook-downloader.user.js",
                chunkFileNames: "[name].js",
            },
        },
    },
    plugins: [
        userscript({
            entry: "src/main.ts",
            header: {
                // Userscript Details
                name: "Ez Audiobook Downloader",
                version: pkg.version,
                description: "Download audiobooks from EzAudiobooksForSoul and similar sites",
                author: "mhay10",
                icon: "https://www.google.com/s2/favicons?sz=64&domain=ezaudiobookforsoul.com",

                // Homepage/Update Info
                homepage: "https://github.com/mhay10/custom-userscripts",
                downloadURL:
                    "https://github.com/mhay10/custom-userscripts/releases/latest/download/Ez-Audiobook-Downloader.user.js",
                updateURL:
                    "https://github.com/mhay10/custom-userscripts/releases/latest/download/Ez-Audiobook-Downloader.meta.js",

                // Userscript Permissions
                match: [
                    "https://ezaudiobookforsoul.com/audiobook/*",
                    "https://audiobooks4soul.com/*",
                ],
                "run-at": "document-end",
            },
        }),
    ],
});
