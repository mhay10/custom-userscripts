import { LOGGER } from "./logger";
import downloadUI from "../lib/download.html?raw";
import { CONFIG } from "./config";
import { waitForElement } from "@repo/common-utils";

main().catch(LOGGER.error);

async function main(): Promise<void> {
    /* TODO: Implement following steps:
    [x] Inject user interface
    [x] Enable download button once UI fully loaded
    [ ] Event listener for when download button is clicked:
        [ ] Prevent multiple clicks
        [ ] Decrypt track urls
        [ ] Event listener to stop audio playback if starts
        [ ] Create zip archive from files
        [ ] Reset download progress
    */

    // Inject UI into page DOM
    const player = await waitForElement(CONFIG.pageUI.playerSelector);
    injectUI(player);

    // Enable download button once player fully loaded
    await waitForPlayerLoadFinish();
    const downloadButton = document.querySelector(CONFIG.customUI.downloadButtonSelector);
    downloadButton?.setAttribute("data-status", "ready");
}

async function waitForPlayerLoadFinish(): Promise<void> {
    return new Promise((resolve) => {
        // Create mutation observer for loading element
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                const target = mutation.target;
                // Check for style changes
                if (
                    mutation.type === "attributes" &&
                    mutation.attributeName === "style" &&
                    target instanceof HTMLElement &&
                    target.id === "loading-message-element"
                ) {
                    // Make sure loading message is hidden
                    const style = target.getAttribute("style");
                    if (style?.includes("display: none")) {
                        // Resolve promise once loaded
                        observer.disconnect();
                        resolve();
                    }
                }
            }
        });

        // Start observing document body for changes
        observer.observe(document.body, {
            attributes: true,
            attributeOldValue: true,
            subtree: true,
        });
    });
}

function injectUI(player: Element): void {
    const errorContainer = player.querySelector(".error-report");
    errorContainer?.insertAdjacentHTML("afterbegin", downloadUI);
}
