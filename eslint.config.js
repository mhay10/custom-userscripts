// @ts-check
/* eslint-disable @typescript-eslint/no-require-imports */
const eslint = require("@eslint/js");
const globals = require("globals");
const tsEslint = require("typescript-eslint");

module.exports = [
  eslint.configs.recommended,
  ...tsEslint.configs.recommended,
  {
    files: ["**/*.ts", "**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.node,
        GM_addStyle: "readonly",
        GM_getValue: "readonly",
        GM_setValue: "readonly",
        GM_deleteValue: "readonly",
        GM_listValues: "readonly",
        GM_registerMenuCommand: "readonly",
        GM_unregisterMenuCommand: "readonly",
        GM_notification: "readonly",
        GM_xmlhttpRequest: "readonly",
        unsafeWindow: "readonly",
      },
    },
    rules: {
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "no-console": "off",
      eqeqeq: ["error", "always"],
      curly: ["error", "all"],
      "prefer-const": "error",
      "no-var": "error",
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
  {
    files: ["**/build.mjs"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  {
    ignores: ["node_modules/**", "**/dist/**", "**/*.user.js"],
  },
];
