// ==UserScript==
// @name         Better Github Dashboard
// @description  Cleans up the dashboard by hiding Copilot, grouping repositories by owner, and displaying active PRs + issues.
// @icon         https://www.google.com/s2/favicons?sz=64&domain=github.com
// @author       mhay10
// @version      0.0.0
// @namespace    https://github.com/mhay10/custom-userscripts
// @license      MIT; https://opensource.org/licenses/MIT
// @match        https://github.com/
// @match        https://github.com/dashboard
// @connect      github.com
// @run-at       document-end
// ==/UserScript==

(function () {
    "use strict";

    // ==========================================
    //                 UTILITIES
    // ==========================================

    const logger = {
        info: (msg) =>
            console.log(`%c[Better GH Dashboard]%c ${msg}`, "color: #00a2ff;"),
        error: (msg) =>
            console.log(`%c[Better GH Dashboard]%c ${msg}`, "color: #ff2c3a;"),
    };

    function debounce(fn, ms) {
        let timer;
        return function (...args) {
            clearTimeout(timer);
            timer = setTimeout(() => fn.apply(this, args), ms);
        };
    }

    function getCspNonce() {
        // Try to find it in a meta tag
        const metaNonce = document
            .querySelector('meta[name="csp-nonce"]')
            ?.getAttribute("content");
        if (metaNonce) return metaNonce;

        // Try to find it from a script tag
        const scriptNonce = document.querySelector("script[nonce]")?.nonce;
        if (scriptNonce) return scriptNonce;

        return null;
    }

    // ==========================================
    //           CONFIGURATION & STATE
    // ==========================================
    const config = {
        selectors: {
            dashboard: "#dashboard",
            repoList: ".js-dashboard-repos-list",
            copilot: ".copilotPreview__container",
            paginationForm: "",
        },
        delays: {
            mutObserverDebounce: 150,
            paginationFetch: 300,
        },
        queries: {
            reviewPRs:
                "is:open is:pr review-requested:@me archived:false sort:updated-desc",
        },
    };

    const state = {
        repos: new Map(),
        isFetching: false,
        paginationComplete: false,
        copilotHidden: false,
        currentUser: "",
    };

    // ==========================================
    //              COPILOT REMOVAL
    // ==========================================

    function hideCopilot() {
        // Don't re-hide if already hidden
        if (state.copilotHidden) return;

        // Get Content Security Policy nonce and apply to a style tag
        const style = document.createElement("style");
        const nonce = getCspNonce();
        if (nonce) style.nonce = nonce;

        // Set style contents to hide the copilot widget
        style.textContent = `
            ${config.selectors.copilot}, ${config.selectors.copilot} * {
                display: none !important;
                visibility: hidden !important;
                height: 0 !important;
            }
        `;

        // Add the style tag to the DOM
        (document.head || document.documentElement).appendChild(style);
        state.copilotHidden = true;
    }

    // ==========================================
    //             REPOSITORY SIDEBAR
    // ==========================================

    function parseRepoNode() {
        /* ... */
    }

    function renderDropdowns() {
        /* ... */
    }

    async function fetchRemainingPages() {
        /* ... */
    }

    // ==========================================
    //             TRIAGE DASHBOARD
    // ==========================================

    async function fetchItems() {
        /* ... */
    }

    function injectDashboard() {
        /* ... */
    }

    // ==========================================
    //         INITIALIZATION & OBSERVER
    // ==========================================

    logger.info("Starting to modify dashboard");

    // TODO: Insert Main logic here
    hideCopilot();

    logger.info("Dashboard modifications complete");
})();
