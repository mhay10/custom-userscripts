import { config } from "./config.js";
import { waitForGeminiBarExist } from "./observer.js";

/**
 * Main entry point for Google Docs - Remove Gemini Bar
 */
async function main(): Promise<void> {
  "use strict";

  // Wait for bar element to exist
  console.log("Waiting for Gemini Bar to load...");
  await waitForGeminiBarExist();

  // Set bar element style with "display: none;"
  console.log("Gemini Bar loaded. Hiding...");
  const elem = document.querySelector(config.pageUI.geminiBarSelector);
  if (elem) {
    (elem as HTMLElement).style.display = "none";
    console.log("Gemini Bar has been successfully hidden");
  } else {
    console.log("Something went wrong. L bozo");
  }
}

// Run the script
main().catch(console.error);
