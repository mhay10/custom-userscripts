/**
 * Scaffolds a new userscript workspace under userscripts/<name>.
 *
 * Usage:
 *   npm run create <name>
 *   npm run create <name> -- --desc "Does something cool"
 *
 * Flags:
 *   --desc <text>       Script description (default: "TODO: describe <name>")
 *
 * After generating files, runs `npm install` at the repo root so the new
 * workspace is linked immediately.
 */

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

// Resolve repo root relative to this script so it can run from anywhere
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const USERS_DIR = join(ROOT, "userscripts");
const AUTHOR = "mhay10";

// ---------------------------------------------------------------------------
// Arg parsing
// ---------------------------------------------------------------------------

/**
 * Parses CLI flags and positionals into a normalized options object.
 * @param {string[]} argv Raw args after the script path
 * @returns {{ name: string, desc?: string }}
 */
function parseArgs(argv) {
    const options = { desc: undefined };
    const positional = [];

    // Walk args one at a time so flag values are consumed correctly
    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];

        if (arg === "--desc") {
            options.desc = argv[++i];
        } else if (arg === "--help" || arg === "-h") {
            printUsage();
            process.exit(0);
        } else if (arg.startsWith("--")) {
            fail(`Unknown option: ${arg}`);
        } else {
            positional.push(arg);
        }
    }

    // Require exactly one positional: the userscript name
    if (positional.length !== 1) {
        printUsage();
        process.exit(1);
    }
    options.name = positional[0];
    return options;
}

function printUsage() {
    console.log(`Usage: npm run create <name> [-- --desc "..."]`);
    console.log(`  name should be kebab-case, e.g. my-cool-script`);
}

function fail(message) {
    console.error(`ERROR: ${message}`);
    process.exit(1);
}

// ---------------------------------------------------------------------------
// Naming helpers
// ---------------------------------------------------------------------------

/** Converts any reasonable input (kebab, camel, spaces) into kebab-case */
function toKebab(name) {
    return name
        .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
        .replace(/[\s_]+/g, "-")
        .toLowerCase();
}

/** Converts kebab-case into PascalCase for the vite lib/global name */
function toPascal(kebab) {
    return kebab
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join("");
}

/** Converts kebab-case into Title Case for the userscript header name */
function toTitle(kebab) {
    return kebab
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------

function packageJsonTemplate({ kebab, description }) {
    return (
        JSON.stringify(
            {
                name: `@userscripts/${kebab}`,
                version: "0.1.0",
                description,
                private: true,
                type: "module",
                main: `./dist/${kebab}.user.js`,
                scripts: {
                    dev: "vite",
                    build: "tsc && vite build",
                    preview: "vite preview",
                },
                dependencies: {
                    "@repo/common-utils": "*",
                },
                devDependencies: {},
            },
            null,
            4
        ) + "\n"
    );
}

const TSCONFIG_TEMPLATE = `{
    "extends": "../../tsconfig.base.json",
    "compilerOptions": {
        "noEmit": true,
        "allowImportingTsExtensions": true
    },
    "include": ["src/**/*", "vite.config.ts"],
    "exclude": ["node_modules", "dist"]
}
`;

function viteConfigTemplate({ kebab, pascal, title, description }) {
    return `import { defineConfig } from "vite";
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
            name: "${pascal}",
            fileName: "${kebab}.user",
            formats: ["iife"],
        },
        rollupOptions: {
            output: {
                entryFileNames: "${kebab}.user.js",
                chunkFileNames: "[name].js",
            },
        },
    },
    plugins: [
        userscript({
            entry: "src/main.ts",
            header: {
                name: "${title}",
                version: pkg.version,
                description: "${description}",
                author: "${AUTHOR}",
                // TODO: set the icon to a favicon for the target site
                icon: "https://www.google.com/s2/favicons?sz=64&domain=example.com",
                // TODO: set the match pattern(s) for the target site
                match: "<insert url(s) here>",
                "run-at": "document-end",
            },
        }),
    ],
});
`;
}

const MAIN_TS_TEMPLATE = `// TODO: implement your userscript logic here

function main(): void {
    console.log("Userscript loaded");
}

main();
`;

const LIB_STYLES_CSS_TEMPLATE = `/*
 * TODO: add stylesheet rules for your userscript here.
 * Import with: import css from "../lib/styles.css?inline";
 */
`;

const TYPES_TS_TEMPLATE = `// TODO: define shared types for your userscript here

export interface Config {
    // TODO: add your config shape
    exampleType: string;
}
`;

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

// Normalize the name and validate it produces a safe kebab-case directory
const options = parseArgs(process.argv.slice(2));
const kebab = toKebab(options.name);

if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(kebab)) {
    fail(
        `Invalid name "${options.name}" (resolved to "${kebab}"). Use letters, numbers, and dashes.`
    );
}

// Refuse to clobber an existing userscript
const targetDir = join(USERS_DIR, kebab);
if (existsSync(targetDir)) {
    fail(`Directory already exists: userscripts/${kebab}`);
}

const pascal = toPascal(kebab);
const title = toTitle(kebab);
const description = options.desc ?? `TODO: describe ${title}`;

// Write every generated file, creating parent dirs as needed
const files = new Map([
    ["package.json", packageJsonTemplate({ kebab, description })],
    ["tsconfig.json", TSCONFIG_TEMPLATE],
    ["vite.config.ts", viteConfigTemplate({ kebab, pascal, title, description })],
    [join("src", "main.ts"), MAIN_TS_TEMPLATE],
    [join("src", "types.ts"), TYPES_TS_TEMPLATE],
    [join("lib", "styles.css"), LIB_STYLES_CSS_TEMPLATE],
]);

for (const [relativePath, content] of files) {
    const filePath = join(targetDir, relativePath);
    mkdirSync(dirname(filePath), { recursive: true });
    writeFileSync(filePath, content);
    console.log(`  created userscripts/${kebab}/${relativePath.replaceAll("\\", "/")}`);
}

// Install at the root so npm links the new workspace and its deps
console.log(`\nInstalling workspace dependencies (npm install)...`);
const exitCode = await new Promise((resolveCode) => {
    const child = spawn("npm", ["install"], { cwd: ROOT, stdio: "inherit", shell: true });
    child.on("close", (code) => resolveCode(code ?? 1));
    child.on("error", (err) => {
        console.error(`npm install failed: ${err.message}`);
        resolveCode(1);
    });
});

if (exitCode === 0) {
    console.log(`\nDone! Next steps:`);
    console.log(
        `  1. Update the @match pattern and icon in userscripts/${kebab}/vite.config.ts (currently placeholders)`
    );
    console.log(`  2. Implement your logic in userscripts/${kebab}/src/main.ts`);
    console.log(`  3. Dev:   npm run dev -w @userscripts/${kebab}`);
    console.log(`     Build: npm run build -w @userscripts/${kebab}`);
}
process.exit(exitCode);
