import { getCspNonce } from "@repo/common-utils";
import { CONFIG } from "../config";
import { STATE } from "../state";
import sidebarCss from "../../lib/styles.css?inline";

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

export function injectSidebarStyes(): void {
    if (document.getElementById("better-gh-dash-styles")) return;

    const style = document.createElement("style");
    const nonce = getCspNonce();
    if (nonce) style.nonce = nonce;
    style.id = "better-gh-dash-styles";
    style.textContent = sidebarCss;

    document.head.appendChild(style);
}
