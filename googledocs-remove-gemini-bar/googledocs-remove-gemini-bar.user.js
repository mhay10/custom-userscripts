// ==UserScript==
// @name         Google Docs - Remove Gemini Bar
// @description  Hides the annoying gemini bar at the bottom of a google doc
// @icon         https://www.google.com/s2/favicons?sz=64&domain=docs.google.com
// @author       mhay10
// @version      0.1.0
// @namespace    https://github.com/mhay10/custom-userscripts
// @license      MIT; https://opensource.org/licenses/MIT
// @match        https://docs.google.com/document/*
// @run-at       document-end
// ==/UserScript==

// Configuration Settings
const config = {
    // UI Selectors
    pageUI: {
        geminiBarSelector: ".kixWizBarkickWrapper.WithHideTransition",
    },
};

(async function () {
    "use strict";

    // Wait for bar element to exist
    console.log("Waiting for Gemini Bar to load...");
    await waitForGeminiBarExist();

    // Set bar element style with "display: none;"
    console.log("Gemini Bar loaded. Hiding...");
    const elem = document.querySelector(config.pageUI.geminiBarSelector);
    if (elem) {
        elem.style.display = "none";
        console.log("Gemini Bar has been successfully hidden");
    } else {
        console.log("Something went wrong. L bozo");
    }
})();

async function waitForGeminiBarExist() {
    // Check if element already exists
    if (document.querySelector(config.pageUI.geminiBarSelector)) {
        return;
    }

    return new Promise(function (resolve) {
        // Create a mutation observer for the DOM
        const observer = new MutationObserver(function (_) {
            if (document.querySelector(config.pageUI.geminiBarSelector)) {
                // Stop observing DOM after element found
                observer.disconnect();
                resolve();
            }
        });

        // Start observing document body for changes
        observer.observe(document.body, { childList: true, subtree: true });
    });
}
