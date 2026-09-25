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
            name: "GoogledocsNoGeminiBar",
            fileName: "googledocs-no-gemini-bar.user",
            formats: ["iife"],
        },
        rollupOptions: {
            output: {
                entryFileNames: "googledocs-no-gemini-bar.user.js",
                chunkFileNames: "[name].js",
            },
        },
    },
    plugins: [
        userscript({
            entry: "src/main.ts",
            header: {
                // Userscript Details
                name: "GoogleDocs No Gemini Bar",
                version: pkg.version,
                description: "Removes floating Gemini bar from bottom of the page",
                author: "mhay10",
                icon: "https://www.google.com/s2/favicons?sz=64&domain=docs.google.com",

                // Homepage/Version Info
                homepage: "https://github.com/mhay10/custom-userscripts",
                downloadURL:
                    "https://github.com/mhay10/custom-userscripts/releases/latest/download/GoogleDocs-No-Gemini-Bar.user.js",
                updateURL:
                    "https://github.com/mhay10/custom-userscripts/releases/latest/download/GoogleDocs-No-Gemini-Bar.meta.js",

                // Userscript Permissions
                match: "https://docs.google.com/document/*",
                "run-at": "document-end",
            },
        }),
    ],
});
