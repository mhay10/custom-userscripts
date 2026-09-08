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
"use strict";
(() => {
  // src/config.ts
  var config = {
    // UI Selectors
    pageUI: {
      geminiBarSelector: ".kixWizBarkickWrapper.WithHideTransition"
    }
  };

  // src/observer.ts
  async function waitForGeminiBarExist() {
    if (document.querySelector(config.pageUI.geminiBarSelector)) {
      return;
    }
    return new Promise((resolve) => {
      const observer = new MutationObserver(() => {
        if (document.querySelector(config.pageUI.geminiBarSelector)) {
          observer.disconnect();
          resolve();
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
    });
  }

  // src/index.ts
  async function main() {
    "use strict";
    console.log("Waiting for Gemini Bar to load...");
    await waitForGeminiBarExist();
    console.log("Gemini Bar loaded. Hiding...");
    const elem = document.querySelector(config.pageUI.geminiBarSelector);
    if (elem) {
      elem.style.display = "none";
      console.log("Gemini Bar has been successfully hidden");
    } else {
      console.log("Something went wrong. L bozo");
    }
  }
  main().catch(console.error);
})();
