import { createLogger } from "@repo/common-utils";
import darkModeStyles from "../lib/styles.css?inline";

function main(): void {
    const logger = createLogger("Scryfall Dark Mode");

    // Inject dark mode styles as a <style> element at document-start
    // Avoid re-injecting if the style tag already exists (e.g. client-side nav)
    if (document.getElementById("scryfall-dark-mode-styles")) {
        return;
    }

    const style = document.createElement("style");
    style.id = "scryfall-dark-mode-styles";
    style.textContent = darkModeStyles;

    const head = document.head || document.documentElement;
    if (head) {
        head.prepend(style);
        logger.info("Scryfall dark mode styles injected");
    } else {
        logger.error("No <head> found; could not inject dark mode styles");
    }
}

main();
