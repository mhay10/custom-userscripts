import { LOGGER } from "./logger";
import { injectCategorizedRepos } from "./modules/grouped-repos";
import { injectQueues } from "./modules/queues";
import { hideUiElements, injectQueueStyles, injectSidebarStyes } from "./modules/styling";
import { setCurrentUser, STATE } from "./state";

/** Entry point: verifies login, hides default UI, injects styles, and loads the grouped repo sidebar */
async function init(): Promise<void> {
    // Only run script if user is logged in
    LOGGER.info("Setting current user...");
    if (!setCurrentUser()) {
        LOGGER.error("Current user is not logged in. Stopping");
        return;
    }
    LOGGER.info(`Current User: ${STATE.currentUser}`);

    // Setup CSS styling
    hideUiElements();
    injectSidebarStyes();
    injectQueueStyles();

    // Inject repo sidebar stuff
    await injectCategorizedRepos();

    // Inject PR/issues stuff
    await injectQueues();
}

init().catch(LOGGER.error);
