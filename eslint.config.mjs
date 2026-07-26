export default [
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "script",
      globals: {
        // Browser
        window: "readonly",
        document: "readonly",
        console: "readonly",
        location: "readonly",
        navigator: "readonly",

        // Tampermonkey/Greasemonkey
        GM_addStyle: "readonly",
        GM_download: "readonly",
        GM_getResourceText: "readonly",
        GM_getResourceURL: "readonly",
        GM_getValue: "readonly",
        GM_setValue: "readonly",
        GM_deleteValue: "readonly",
        GM_listValues: "readonly",
        GM_notification: "readonly",
        GM_openInTab: "readonly",
        GM_registerMenuCommand: "readonly",
        GM_unregisterMenuCommand: "readonly",
        GM_xmlhttpRequest: "readonly",
        unsafeWindow: "readonly",

        // Libraries
        async: "readonly",
        fflate: "readonly",
        saveAs: "readonly",
      },
    },
    rules: {
      // Errors
      "no-undef": "error",
      "no-unused-vars": "error",
      "no-unreachable": "error",
      "no-shadow": "error",
      "no-dupe-keys": "error",
      "no-dupe-args": "error",

      // Safer code
      eqeqeq: ["error", "always"],
      curly: ["error", "all"],
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-with": "error",

      // Modern, but compatible
      "no-var": "error",
      "prefer-const": "error",

      // Readability
      "dot-notation": "error",
      "object-shorthand": "error",
      "prefer-template": "warn",

      // Intentionally disabled
      "prefer-arrow-callback": "off",
    },
  },
];
