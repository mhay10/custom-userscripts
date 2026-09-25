import { createLogger, waitForElement } from "@repo/common-utils";

// Create logger
const logger = createLogger("Hide Gemini Bar");

// Gemini bar CSS selector
const barSelector = ".kixWizBarkickWrapper.WithHideTransition";

async function main(): Promise<void> {
    // Wait for the bar element to exist
    logger.info("Waiting for Gemini bar to load...");
    waitForElement<HTMLElement>(barSelector)
        .then((elem) => {
            // Set bar's CSS style with "display: none;"
            logger.info("Gemini bar loaded. Hiding...");
            if (elem) {
                elem.style.display = "none";
                logger.info("Gemini bar successfull hidden");
            } else {
                logger.error("Something went wrong. L bozo");
            }
        })
        .catch(logger.error);
}

main();
