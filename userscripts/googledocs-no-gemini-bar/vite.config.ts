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
                name: "Googledocs No Gemini Bar",
                version: pkg.version,
                description: "Removes floating Gemini bar from bottom of the page",
                author: "mhay10",
                // TODO: set the icon to a favicon for the target site
                icon: "https://www.google.com/s2/favicons?sz=64&domain=example.com",
                // TODO: set the match pattern(s) for the target site
                match: "<insert url(s) here>",
                "run-at": "document-end",
            },
        }),
    ],
});
