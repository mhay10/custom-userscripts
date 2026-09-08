// ==UserScript==
// @name         GitHub Unified Dashboard
// @namespace    https://github.com/your-username
// @version      1.0.0
// @description  Unifies Issues and Pull Requests into a single chronological feed on the GitHub Dashboard.
// @author       Your Name
// @match        https://github.com/*
// @match        https://github.com/
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @connect      github.com
// @run-at       document-end
// ==/UserScript==

"use strict";
(() => {
  // src/config.ts
  var config = {
    debug: true,
    itemsPerPage: 50,
    dashboardSelector: ".dashboard",
    feedSelector: ".news"
  };
  function isDebug() {
    return config.debug;
  }
  function log(...args) {
    if (isDebug()) {
      console.log("[GitHub Unified Dashboard]", ...args);
    }
  }
  function error(...args) {
    console.error("[GitHub Unified Dashboard]", ...args);
  }

  // src/state.ts
  var state = {
    initialized: false,
    isLoading: false,
    lastFetchedAt: null,
    items: [],
    observer: null
  };
  function isInitialized() {
    return state.initialized;
  }
  function setIsInitialized(value) {
    state.initialized = value;
  }
  function addItem(item) {
    const exists = state.items.some((i) => i.id === item.id);
    if (!exists) {
      state.items.push(item);
    }
  }
  function getItems() {
    return [...state.items].sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
  }

  // src/observer.ts
  var defaultOptions = {
    childList: true,
    subtree: true
  };
  function createObserver(callback, _options) {
    const observer = new MutationObserver((mutations) => {
      log("Observer triggered with", mutations.length, "mutations");
      callback(mutations);
    });
    return observer;
  }
  function observeElement(observer, element, _options) {
    if (!element) {
      return;
    }
    const opts = { ...defaultOptions, ..._options };
    observer.observe(element, opts);
    log("Observing element", element);
  }
  function waitForElement(selector, timeout = 1e4) {
    return new Promise((resolve, reject) => {
      const element = document.querySelector(selector);
      if (element) {
        resolve(element);
        return;
      }
      const observer = new MutationObserver((_mutations, obs) => {
        const el = document.querySelector(selector);
        if (el) {
          obs.disconnect();
          resolve(el);
        }
      });
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
      setTimeout(() => {
        observer.disconnect();
        reject(new Error(`Timeout waiting for element: ${selector}`));
      }, timeout);
    });
  }

  // src/features/unified-feed.ts
  function parseFeedItem(element) {
    try {
      const titleEl = element.querySelector("[data-hydro-click] a, .title a");
      const authorEl = element.querySelector('.author a, [data-test-id="lead-issue-author"] a');
      const timeEl = element.querySelector("relative-time, time");
      if (!titleEl || !authorEl) {
        return null;
      }
      const title = titleEl.textContent?.trim() || "";
      const author = authorEl.textContent?.trim() || "";
      const repo = titleEl.href?.split("/").slice(0, 5).join("/") || "";
      const url = titleEl.getAttribute("href") || "";
      const timestamp = timeEl ? new Date(timeEl.getAttribute("datetime") || Date.now()) : /* @__PURE__ */ new Date();
      const isPR = element.querySelector(".octicon-git-pull-request") !== null;
      const isIssue = element.querySelector(".octicon-issue-opened") !== null;
      const type = isPR ? "pull_request" : isIssue ? "issue" : "commit";
      const id = `${type}:${url}`;
      return {
        id,
        type,
        title,
        author,
        repo,
        timestamp,
        url,
        html: element.outerHTML
      };
    } catch (e) {
      error("Failed to parse feed item:", e);
      return null;
    }
  }
  function collectFeedItems(container) {
    const items = [];
    const feedElements = container.querySelectorAll(".news > li, .feed-item");
    feedElements.forEach((el) => {
      const item = parseFeedItem(el);
      if (item) {
        items.push(item);
        addItem(item);
      }
    });
    log(`Collected ${items.length} feed items`);
    return items;
  }
  function renderUnifiedFeed(container) {
    const items = getItems();
    log(`Rendering ${items.length} items in unified feed`);
    const badge = document.createElement("span");
    badge.className = "unified-feed-badge";
    badge.textContent = `(${items.length})`;
    badge.style.cssText = "margin-left: 8px; color: #58a6ff; font-weight: bold;";
    const dashboardHeader = container.querySelector(".dashboard-header h2");
    if (dashboardHeader && !dashboardHeader.querySelector(".unified-feed-badge")) {
      dashboardHeader.appendChild(badge);
    }
  }
  function initUnifiedFeed(container) {
    log("Initializing unified feed");
    collectFeedItems(container);
    renderUnifiedFeed(container);
  }

  // src/index.ts
  function injectStyles() {
    if (typeof GM_addStyle !== "undefined") {
      GM_addStyle(`
      .unified-feed-badge {
        margin-left: 8px;
        color: #58a6ff;
        font-weight: bold;
      }
      
      .unified-dashboard-enhanced {
        background: linear-gradient(180deg, rgba(88,166,255,0.1) 0%, transparent 100%);
        border-radius: 6px;
        padding: 8px;
      }
    `);
    }
  }
  async function initializeDashboard() {
    if (isInitialized()) {
      log("Already initialized");
      return;
    }
    try {
      log("Initializing GitHub Unified Dashboard...");
      const dashboard = await waitForElement(config.dashboardSelector);
      log("Dashboard container found:", dashboard);
      injectStyles();
      initUnifiedFeed(dashboard);
      const observer = createObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.addedNodes.length > 0) {
            log("New nodes added, re-initializing feed");
            initUnifiedFeed(dashboard);
          }
        });
      });
      const feedContainer = dashboard.querySelector(config.feedSelector);
      if (feedContainer) {
        observeElement(observer, feedContainer);
      }
      setIsInitialized(true);
      log("GitHub Unified Dashboard initialized successfully!");
    } catch (e) {
      error("Failed to initialize dashboard:", e);
    }
  }
  function initDashboard() {
    if (!document.querySelector(config.dashboardSelector)) {
      log("Not on dashboard page, skipping initialization");
      return;
    }
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initializeDashboard);
    } else {
      initializeDashboard();
    }
  }
  if (typeof window !== "undefined") {
    initDashboard();
  }
})();
