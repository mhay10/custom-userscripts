import { waitForElement } from "@repo/common-utils";
import { LOGGER } from "./logger";
import darkModeStyles from "../lib/styles.css?inline";
import toggleLightSvg from "../lib/toggle-light.svg?raw";
// import toggleDarkSvg from "../lib/toggle-dark.svg?raw";

function main(): void {
    // Avoid re-injecting if the dark mode styles if they already exists
    if (document.getElementById("scryfall-dark-mode-styles")) {
        return;
    }

    // Create style tag and add to header
    const style = document.createElement("style");
    style.id = "scryfall-dark-mode-styles";
    style.textContent = darkModeStyles;

    const head = document.head || document.documentElement;
    if (head) {
        head.prepend(style);
        LOGGER.info("Scryfall dark mode styles injected");
    } else {
        LOGGER.error("No <head> found; could not inject dark mode styles");
        return;
    }

    // Add light/dark mode toggle button to header (wait for it to exist)
    waitForElement<HTMLElement>("#header .header-links").then((header) => {
        addDarkModeToggle(header);
    });
}

/** Injects a toggle link into #header that enables/disables the dark mode style sheet. */
function addDarkModeToggle(header: HTMLElement): void {
    // Create toggle button and add to header
    const toggle = document.createElement("a");
    toggle.id = "scryfall-dark-mode-toggle";
    toggle.className = "header-link icon-only";
    toggle.href = "#";
    toggle.setAttribute("aria-label", "Toggle Scryfall Dark Mode");
    toggle.title = "Toggle Scryfall Dark Mode";
    toggle.innerHTML = toggleLightSvg;
    header.appendChild(toggle);

    // Add event listener to switch themes when clicked
    toggle.addEventListener("click", () => {
        // TODO: Figure out why this doesn't get called
        LOGGER.info("Clicked");
    });

    LOGGER.info("Scryfall dark mode toggle added to #header");
}

main();
