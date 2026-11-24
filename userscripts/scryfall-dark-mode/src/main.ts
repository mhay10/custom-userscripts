import { waitForElement } from "@repo/common-utils";
import { LOGGER } from "./logger";
import variablesStyles from "../lib/styles/variables.css?inline";
import globalStyles from "../lib/styles/global.css?inline";
import advancedStyles from "../lib/styles/advanced.css?inline";
import docsStyles from "../lib/styles/docs.css?inline";
import docsSyntaxStyles from "../lib/styles/docs-syntax.css?inline";
import setsStyles from "../lib/styles/sets.css?inline";
import cardStyles from "../lib/styles/card.css?inline";
import toggleLightSvg from "../lib/toggle-light.svg?raw";
import toggleDarkSvg from "../lib/toggle-dark.svg?raw";

const darkModeStyles = [
    variablesStyles,
    globalStyles,
    advancedStyles,
    docsStyles,
    docsSyntaxStyles,
    setsStyles,
    cardStyles,
].join("\n");
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

/** Swaps the toggle icon and keeps it outlined even when Scryfall's own `.header-link path` fill applies. */
function setToggleIcon(toggle: HTMLElement, svg: string): void {
    toggle.innerHTML = svg;
    // Set through CSSOM because the page CSP blocks inline style attributes
    toggle.querySelectorAll<SVGElement>("path, circle").forEach((el) => {
        el.style.fill = "none";
    });
}

/** Injects a toggle link into #header that enables/disables the dark mode style sheet. */
function addDarkModeToggle(header: HTMLElement): void {
    // Create toggle button and add to header
    const toggle = document.createElement("button");
    toggle.id = "scryfall-dark-mode-toggle";
    toggle.className = "header-link icon-only";
    toggle.type = "button";
    toggle.setAttribute("aria-label", "Toggle Scryfall Dark Mode");
    toggle.title = "Toggle Scryfall Dark Mode";
    setToggleIcon(toggle, toggleLightSvg);

    header.appendChild(toggle);
    LOGGER.info("Scryfall dark mode toggle added to header");

    let enabled = true;

    // Add event listener to switch themes when clicked
    // Using document-level delegation because element-level listeners don't fire
    document.addEventListener("click", (event) => {
        const target = event.target as HTMLElement;
        // Use the live button; the original reference can go stale if the page re-renders the header
        const button = target.closest<HTMLElement>("#scryfall-dark-mode-toggle");
        if (button) {
            enabled = !enabled;
            const style = document.getElementById("scryfall-dark-mode-styles");
            if (style) {
                // @ts-expect-error — HTMLStyleElement.disabled is supported in all modern browsers
                style.disabled = !enabled;
            }

            setToggleIcon(button, enabled ? toggleLightSvg : toggleDarkSvg);

            LOGGER.info(`Scryfall dark mode ${enabled ? "enabled" : "disabled"}`);
        }
    });
}

main();
