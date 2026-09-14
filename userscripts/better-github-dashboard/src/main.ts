import { debounce } from "@repo/common-utils";
import { CONFIG } from "./config";
import { LOGGER } from "./logger";
import { fetchRemainingPages } from "./modules/group-repos";
import { hideUiElements, injectSidebarStyes } from "./modules/styles";
import { setCurrentUser, STATE } from "./state";

async function update(): Promise<void> {
    hideUiElements();
    injectSidebarStyes();
    await fetchRemainingPages();

    const personalRepos = document.querySelector(
        CONFIG.selectors.personalRepoList
    ) as HTMLDetailsElement;
    if (personalRepos) {
        personalRepos.open = true;
    }
}

async function init(): Promise<void> {
    LOGGER.info("Setting current user...");
    if (!setCurrentUser()) {
        LOGGER.error("Current user is not logged in. Stopping");
        return;
    }
    LOGGER.info(`Current User: ${STATE.currentUser}`);

    await update();

    const debouncedUpdate = debounce(update, CONFIG.delays.mutObserverDebounce);
    const observer = new MutationObserver(debouncedUpdate);
    observer.observe(document.body, { childList: true, subtree: true });
}

init().catch(LOGGER.error);
document.addEventListener("turbo:load", init);
document.addEventListener("turbo:render", init);
