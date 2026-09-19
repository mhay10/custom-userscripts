import { getCspNonce } from "@repo/common-utils";
import { CONFIG } from "../config";
import { STATE } from "../state";
import sidebarCss from "../../lib/sidebarStyles.css?inline";
import queueCss from "../../lib/queueStyles.css?inline";

/** Injects a stylesheet that hides GitHub's Copilot widget, "show more" button, and original repo list */
export function hideUiElements(): void {
    // Don't re-hide if already hidden
    if (STATE.copilotHidden) return;

    // Get Content Security Policy nonce and apply to a style tag
    const style = document.createElement("style");
    const nonce = getCspNonce();
    if (nonce) style.nonce = nonce;

    // Set style contents to hide the copilot widget
    style.textContent = `
        ${CONFIG.selectors.copilotElems}, ${CONFIG.selectors.copilotElems} *,
        ${CONFIG.selectors.sideShowMoreButton}, ${CONFIG.selectors.sideShowMoreButton} *,
        ${CONFIG.selectors.repoList}, ${CONFIG.selectors.repoList} * {
            display: none !important;
            visibility: hidden !important;
            height: 0 !important;
        }
    `;

    // Add the style tag to the DOM
    (document.head || document.documentElement).appendChild(style);
    STATE.copilotHidden = true;
}

/** Injects the custom sidebar stylesheet */
export function injectSidebarStyles(): void {
    // Skip if styles have already been injected
    if (document.getElementById("better-gh-dash-sidebar-styles")) return;

    // Create style tag and copy CSS file contents to it
    const styleElem = document.createElement("style");
    const nonce = getCspNonce();
    if (nonce) styleElem.nonce = nonce;
    styleElem.id = "better-gh-dash-sidebar-styles";
    styleElem.textContent = sidebarCss;

    // Add style tag to DOM
    document.head.appendChild(styleElem);
}

/** Injects the custom queues stylesheet */
export function injectQueueStyles(): void {
    // Skip if styles have already been injected
    if (document.getElementById("better-gh-dash-queue-styles")) return;

    // Create style tag and copy CSS file contents to it
    const styleElem = document.createElement("style");
    const nonce = getCspNonce();
    if (nonce) styleElem.nonce = nonce;
    styleElem.id = "better-gh-dash-queue-styles";
    styleElem.textContent = queueCss;

    // Add style tag to DOM
    document.head.appendChild(styleElem);
}
