import { LOGGER } from "./logger";
import downloadUI from "../lib/download.html?raw";
import { CONFIG } from "./config";
import { waitForElement } from "@repo/common-utils";

main().catch(LOGGER.error);

async function main(): Promise<void> {
    /* TODO: Implement following steps:
    [ ] Inject user interface
    [ ] Enable download button once UI fully loaded
    [ ] Event listener for when download button is clicked:
        [ ] Prevent multiple clicks
        [ ] Decrypt track urls
        [ ] Event listener to stop audio playback if starts
        [ ] Create zip archive from files
        [ ] Reset download progress
    */

    // Inject UI into page DOM
    const player = await waitForElement(CONFIG.pageUI.playerSelector);
    if (!player) throw ReferenceError("Player element does not exist. Cannot continue");
    injectUI(player);
}

function injectUI(player: Element): void {
    const errorContainer = player.querySelector(".error-report");
    errorContainer?.insertAdjacentHTML("afterbegin", downloadUI);
}
