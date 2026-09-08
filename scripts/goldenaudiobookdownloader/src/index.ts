import { config } from "./config.js";
import { injectBootstrap, injectUserInterface, updateProgress } from "./ui.js";
import { downloadAudioTrack, getZipFilename } from "./downloader.js";

interface DownloadSlot {
  index: number;
}

let downloadSlots: DownloadSlot[] = [];

/**
 * Create a ZIP blob from downloaded tracks
 * @param trackUrls - Array of track URLs to download
 * @returns Promise resolving with the ZIP blob
 */
async function createZipBlob(trackUrls: string[]): Promise<Uint8Array> {
  const folder = getZipFilename(trackUrls[0]).replace(".zip", "");
  const files: Record<string, Uint8Array> = {};

  // Keep track of free download slots
  const freeSlots = downloadSlots.map((_, index) => index);

  // Download audio tracks with limited concurrency
  let numDownloaded = 0;
  await async.forEachOfLimit(trackUrls, 3, async (trackUrl: string, index: number) => {
    // Get next free download slot
    const slot = freeSlots.shift() ?? 0;

    // Download audio track and store data
    const response = await downloadAudioTrack(trackUrl, slot);
    files[`${folder}/${config.filePrefix}${index + 1}.mp3`] = new Uint8Array(response.response);

    // Free download slot
    freeSlots.push(slot);

    // Update download progress
    numDownloaded++;
    updateProgress("Downloading...", numDownloaded, trackUrls.length);
  });

  // Create ZIP archive
  return fflate.zipSync(files, { level: 0 });
}

/**
 * Main entry point for GoldenAudiobook Downloader
 */
async function main(): Promise<void> {
  "use strict";

  // Inject Bootstrap into DOM
  injectBootstrap();
  console.log("Injected Bootstrap CSS");

  // Wait for page to finish loading
  if (document.readyState === "loading") {
    await new Promise<void>((resolve) => {
      document.addEventListener("DOMContentLoaded", () => resolve(), { once: true });
    });
  }
  console.log("Page fully loaded");

  // Inject the UI into DOM
  injectUserInterface();
  console.log("Custom UI injected");

  // Initialize download slots
  downloadSlots = [{ index: 0 }, { index: 1 }, { index: 2 }];

  // Start download when button is clicked
  const downloadButton = document.querySelector(
    config.customUI.downloadButtonSelector
  ) as HTMLElement;

  if (!downloadButton) {
    console.error("Download button not found");
    return;
  }

  downloadButton.addEventListener("click", async () => {
    // Prevent multiple clicks
    if (downloadButton.getAttribute("data-status") === "ready") {
      downloadButton.setAttribute("data-status", "downloading");
    } else {
      return;
    }
    console.log("Audiobook download started");

    // Get audio source URLs
    const audioElems = Array.from(
      document.querySelectorAll(config.pageUI.audioSelector)
    ) as HTMLAudioElement[];
    const trackUrls = audioElems.map((audioElem) => audioElem.src);
    console.log(`Found ${trackUrls.length} track urls`);

    // Create and save ZIP archive
    updateProgress("Downloading...", 0, trackUrls.length);
    const zip = await createZipBlob(trackUrls);
    saveAs(new Blob([zip]), getZipFilename(trackUrls[0]));

    // Reset download button
    updateProgress("---", "-", "-");
    downloadButton.setAttribute("data-status", "ready");
  });
}

// Run the script
main().catch(console.error);
