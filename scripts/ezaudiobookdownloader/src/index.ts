import { config } from "./config.js";
import { waitForAudioTrackLoad, waitForPlayerLoadFinish } from "./observer.js";
import { updateProgress, injectUserInterface } from "./ui.js";
import { downloadAudioTrack, getZipFilename } from "./downloader.js";

/**
 * Decrypt track URLs by simulating clicks and waiting for audio to load
 * @param trackElements - The track elements to process
 * @returns Array of decrypted track URLs
 */
async function decryptTrackUrls(trackElements: Element[]): Promise<string[]> {
  const trackUrls: string[] = [];

  for (const [i, track] of trackElements.entries()) {
    // Load track URL by simulating click
    (track as HTMLElement).click();
    await waitForAudioTrackLoad(track);
    updateProgress("Decrypting...", i + 1, trackElements.length);

    // Get track URL
    const trackUrl = track.getAttribute("data-src");
    if (trackUrl) {
      trackUrls.push(trackUrl);
    }
  }

  // Skip first track (promotional)
  trackUrls.shift();

  console.log("Number of tracks found:", trackUrls.length);
  return trackUrls;
}

/**
 * Create a ZIP blob from downloaded tracks
 * @param trackUrls - Array of track URLs to download
 * @returns Promise resolving with the ZIP blob
 */
async function createZipBlob(trackUrls: string[]): Promise<Uint8Array> {
  const folder = getZipFilename(trackUrls[0]).replace(".zip", "");
  const files: Record<string, Uint8Array> = {};

  // Download audio tracks with limited concurrency
  let numDownloaded = 0;
  const activeSlots: (number | null)[] = [];

  await async.forEachOfLimit(trackUrls, 3, async (trackUrl: string, index: number) => {
    // Find available slot
    const slotIndex = activeSlots.findIndex((slot) => slot === null || slot === undefined);
    const slot = slotIndex === -1 ? activeSlots.length : slotIndex;
    activeSlots[slot] = index;

    // Download audio track
    const response = await downloadAudioTrack(trackUrl, slot);
    files[`${folder}/${config.filePrefix}${index + 1}.mp3`] = new Uint8Array(response.response);

    // Clear slot and update progress
    activeSlots[slot] = null;
    numDownloaded++;
    updateProgress("Downloading...", numDownloaded, trackUrls.length);
  });

  // Create ZIP archive
  return fflate.zipSync(files, { level: 0 });
}

/**
 * Main entry point for EzAudiobooksForSoul Downloader
 */
async function main(): Promise<void> {
  "use strict";

  // Get player element and inject UI
  const player = document.querySelector(config.pageUi.playerSelector);
  if (!player) {
    console.error("Player element not found");
    return;
  }

  injectUserInterface(player);

  // Get other useful elements
  const audioElement = player.querySelector(config.pageUi.audioSelector) as HTMLAudioElement;
  const playlist = player.querySelector(config.pageUi.playlistSelector);
  const trackElements = playlist?.querySelectorAll(config.pageUi.trackSelector);
  const downloadButton = player.querySelector(
    config.customUi.downloadButtonSelector
  ) as HTMLElement;

  if (!trackElements || !downloadButton) {
    console.error("Required elements not found");
    return;
  }

  const trackArray = Array.from(trackElements);

  // Enable download button once fully loaded
  await waitForPlayerLoadFinish();
  downloadButton.setAttribute("data-status", "ready");

  // Start download when button is clicked
  downloadButton.addEventListener("click", async () => {
    // Prevent multiple clicks
    if (downloadButton.getAttribute("data-status") === "ready") {
      downloadButton.setAttribute("data-status", "downloading");
    } else {
      return;
    }

    // Get decrypted track URLs
    const trackUrls = await decryptTrackUrls(trackArray);

    // Pause audio playback when playing
    audioElement.addEventListener("play", () => {
      audioElement.pause();
    });

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
