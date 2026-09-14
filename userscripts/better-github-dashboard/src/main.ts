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
}

(async (): Promise<void> => {
    await init();
})();
