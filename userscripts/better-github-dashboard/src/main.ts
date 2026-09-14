import { delay } from "@repo/common-utils";
import { CONFIG } from "./config";
import { LOGGER } from "./logger";
import { fetchRemainingPages } from "./modules/group-repos";
import { hideUiElements, injectSidebarStyes } from "./modules/styles";
import { setCurrentUser, STATE } from "./state";

async function init(): Promise<void> {
    LOGGER.info("Setting current user...");
    if (!setCurrentUser()) {
        LOGGER.error("Current user is not logged in. Stopping");
        return;
    }
    LOGGER.info(`Current User: ${STATE.currentUser}`);

    hideUiElements();
    injectSidebarStyes();
    await fetchRemainingPages();

    await delay(500);

    LOGGER.info("Opening personal repos...");
    const personalReposElem = document.querySelector(
        CONFIG.selectors.personalRepoList
    ) as HTMLDetailsElement;
    if (personalReposElem) {
        personalReposElem.open = true;
    }
}

(async (): Promise<void> => {
    await init();
})();
