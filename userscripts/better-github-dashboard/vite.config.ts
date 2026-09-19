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
            name: "BetterGithubDashboard",
            fileName: "better-github-dashboard.user",
            formats: ["iife"],
        },
        // minify: true,
        // cssMinify: true,
        rollupOptions: {
            output: {
                entryFileNames: "better-github-dashboard.user.js",
                chunkFileNames: "[name].js",
            },
        },
    },
    plugins: [
        userscript({
            entry: "src/main.ts",
            header: {
                name: "Better Github Dashboard",
                version: pkg.version,
                description:
                    "A cleaner GitHub dashboard that hides Copilot, displays active PRs/issues, and groups repos by owner",
                author: "mhay10",
                icon: "https://www.google.com/s2/favicons?sz=64&domain=github.com",
                match: ["https://github.com/", "https://github.com/dashboard"],
                connect: "github.com",
                "run-at": "document-end",
            },
        }),
    ],
});
