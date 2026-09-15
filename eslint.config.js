import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import { fileURLToPath } from "url";
import { dirname } from "path";

const rootDir = dirname(fileURLToPath(import.meta.url));

export default [
    {
        ignores: ["dist", "node_modules", "coverage"],
    },
    {
        files: ["**/*.ts", "**/*.tsx"],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                projectService: true,
                tsconfigRootDir: rootDir,
            },
        },
        plugins: {
            "@typescript-eslint": tsPlugin,
        },
        rules: {
            ...tsPlugin.configs.strict.rules,
            "@typescript-eslint/explicit-function-return-type": "error",
            "@typescript-eslint/explicit-module-boundary-types": "error",
            "@typescript-eslint/no-explicit-any": "off",
        },
    },
];
