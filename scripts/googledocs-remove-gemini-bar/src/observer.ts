import { config } from "./config.js";

/**
 * Wait for the Gemini Bar element to exist in the DOM
 * @returns Promise that resolves when the element is found
 */
export async function waitForGeminiBarExist(): Promise<void> {
  // Check if element already exists
  if (document.querySelector(config.pageUI.geminiBarSelector)) {
    return;
  }

  return new Promise((resolve) => {
    // Create a mutation observer for the DOM
    const observer = new MutationObserver(() => {
      if (document.querySelector(config.pageUI.geminiBarSelector)) {
        // Stop observing DOM after element found
        observer.disconnect();
        resolve();
      }
    });

    // Start observing document body for changes
    observer.observe(document.body, { childList: true, subtree: true });
  });
}
