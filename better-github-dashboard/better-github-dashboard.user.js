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

(async function () {
    "use strict";

    // ==========================================
    //           CONFIGURATION & STATE
    // ==========================================
    const config = {
        selectors: {
            repoList: "ul.js-dashboard-repos-list",
            repoPaginationForm:
                "form.js-ajax-pagination, form.js-more-repos-form",
            copilotElems:
                '.copilotPreview__container, react-partial[partial-name*="copilot"]',
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
    //                 UTILITIES
    // ==========================================

    const logger = {
        info: (msg) =>
            console.log(`%c[Better GH Dashboard]%c ${msg}`, "color: #74E4EE;"),
        error: (msg) =>
            console.log(`%c[Better GH Dashboard]%c ${msg}`, "color: #EE3B60;"),
    };

    function delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    function debounce(fn, ms) {
        let timer;
        return function (...args) {
            clearTimeout(timer);
            timer = setTimeout(() => fn.apply(this, args), ms);
        };
    }

    function getCspNonce() {
        // Try to get nonce from a meta tag
        const metaNonce = document
            .querySelector('meta[name="csp-nonce"]')
            ?.getAttribute("content");
        if (metaNonce) return metaNonce;

        // Try to get nonce from a script tag
        const scriptNonce = document.querySelector("script[nonce]")?.nonce;
        if (scriptNonce) return scriptNonce;

        return null;
    }

    function setCurrentUser() {
        // Don't re-set if current user has already been set
        if (state.currentUser) return;

        // Try to find current user from a meta tag
        const currentUser = document
            .querySelector('meta[name="user-login"]')
            ?.getAttribute("content")
            ?.toLowerCase();

        // Set state's current user if found
        if (currentUser) {
            state.currentUser = currentUser;
            return true;
        }

        return false;
    }

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
            ${config.selectors.copilotElems}, ${config.selectors.copilotElems} * {
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

    function parseRepoNode(node) {
        // Get link conatiner
        const linkElem = node.querySelector(
            'a[data-hovercard-type="repository"]',
        );
        if (!linkElem) return null;

        // Cleanup URL to not be absolute or have a leading slash
        const rawHref = linkElem.getAttribute("href") || "";
        const cleanPath = rawHref
            .replace(/^https?:\/\/[^\/]+/, "") // Remove https:// url portion
            .replace(/^\//, ""); // Remove starting slashes

        // Split URL into parts and make sure that enough exist
        const parts = cleanPath.split("/");
        if (parts.length < 2) return null;
        const repoOwner = parts[0];
        const repoName = parts[1];

        // Get avatar image src
        const imgElem = node.querySelector("img.avatar, img.avatar-small");
        const avatarSrc = imgElem ? imgElem.getAttribute("src") : "";

        // Check if repo is a peronal repo
        const isPersonal =
            state.currentUser &&
            state.currentUser.toLowerCase() == repoOwner.toLowerCase();

        // Return parsed object
        return {
            repoName: repoName,
            repoOwner: repoOwner,
            repo: `${repoOwner}/${repoName}`.toLowerCase(), // Force lowercase for deduplication
            category: isPersonal ? "Personal" : repoOwner,
            avatarSrc: avatarSrc,
        };
    }

    function renderRepoDropdowns() {
        /* ... */
    }

    async function fetchRemainingPages() {
        // Don't request more repos if already being requested
        if (state.isFetching || state.paginationComplete) return;

        // Start fetch rest of the pages
        state.isFetching = true;

        // Loop while the form cursor exists
        let cursor = document
            .querySelector('input[name="repos_cursor"]')
            ?.getAttribute("value");
        for (let pageCount = 1; pageCount < 50 && cursor; pageCount++) {
            // Wait to avoid rate limiting
            await delay(config.delays.paginationFetch);

            // Send request to get next page of repos
            const url = "/dashboard/ajax_my_repositories";
            const params = new URLSearchParams({
                location: "left",
                repos_cursor: cursor,
            });
            const response = await fetch(`${url}?${params}`, {
                headers: { "X-Requested-With": "XMLHttpRequest" },
            });

            // Stop fetching if the response returns an error
            if (!response.ok) break;

            // Parse HTML from response
            const html = new DOMParser().parseFromString(
                await response.text(),
                "text/html",
            );

            // Get all repo elements in HTML and parse them
            html.querySelectorAll("li").forEach((li) => {
                const data = parseRepoNode(li);
                if (data) state.repos.set(data.repo, data);
            });

            // Check if another form cursor exists and update the UI
            cursor = html
                .querySelector('input[name="repos_cursor"]')
                ?.getAttribute("value");
            renderRepoDropdowns();
        }

        // Update fetch state flags and do one final render call
        state.isFetching = false;
        state.paginationComplete = true;
        renderRepoDropdowns();
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

    await delay(1000);

    if (!setCurrentUser()) {
        logger.error("Current is not logged in. Stopping");
        return;
    }

    logger.info(`Current User: ${state.currentUser}`);
    logger.info("Starting to modify dashboard...");

    logger.info("Setting current user...");

    // TODO: Insert Main logic here
    logger.info("Hiding Copilot widget...");
    hideCopilot();

    logger.info("Fetching all repositories...");
    await fetchRemainingPages();

    console.log(state.repos);

    logger.info("Dashboard modifications complete");
})();
