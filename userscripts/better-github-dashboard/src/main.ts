import { LOGGER } from "./logger";
import { injectCategorizedRepos } from "./modules/grouped-repos";
import { injectQueues } from "./modules/queues";
import { hideUiElements, injectQueueStyles, injectSidebarStyles } from "./modules/styling";
import { setCurrentUser, STATE } from "./state";

init().catch(LOGGER.error);

/** Entry point: verifies login, hides default UI, injects styles, and loads the grouped repo sidebar */
async function init(): Promise<void> {
    // Only run script if user is logged in
    if (!setCurrentUser()) {
        LOGGER.error("Current user is not logged in. Stopping");
        return;
    }
    LOGGER.info(`Current User: ${STATE.currentUser}`);

    // Setup UI elements
    injectUI();

    // Re-run on Turbo navigation stuff
    document.addEventListener("turbo:load", () => {
        LOGGER.debug("Turbo page load detected. Re-running UI injection");
        injectUI();
    });
}

/** Inject custom UI elements */
async function injectUI(): Promise<void> {
    // Reset state flags so re-injection works
    STATE.paginationComplete = false;
    STATE.copilotHidden = false;
    STATE.repos.clear();

    hideUiElements();
    injectSidebarStyles();
    injectQueueStyles();

    LOGGER.info("Injecting categorized repo lists...");
    await injectCategorizedRepos();

    LOGGER.info("Injecting PR/issue queues...");
    await injectQueues();
}
