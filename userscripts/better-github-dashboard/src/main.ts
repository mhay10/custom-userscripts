import { LOGGER } from "./logger";
import { injectCategorizedRepos } from "./modules/grouped-repos";
import { injectQueues } from "./modules/queues";
import { hideUiElements, injectQueueStyles, injectSidebarStyles } from "./modules/styling";
import { setCurrentUser, STATE } from "./state";

/** Entry point: verifies login, hides default UI, injects styles, and loads the grouped repo sidebar */
async function init(): Promise<void> {
    // Only run script if user is logged in
    if (!setCurrentUser()) {
        LOGGER.error("Current user is not logged in. Stopping");
        return;
    }
    LOGGER.info(`Current User: ${STATE.currentUser}`);

    // Setup CSS styling
    hideUiElements();
    injectSidebarStyles();
    injectQueueStyles();

    // Inject repo sidebar stuff
    LOGGER.info("Injecting categorized repo lists...");
    await injectCategorizedRepos();

    // Inject PR/issues stuff
    LOGGER.info("Injecting PR/issue queues...");
    await injectQueues();
}

init().catch(LOGGER.error);
