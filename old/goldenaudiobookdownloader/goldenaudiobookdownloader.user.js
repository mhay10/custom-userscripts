// ==UserScript==
// @name         Download GoldenAudiobook Audiobooks
// @description  Download audiobooks from GoldenAudiobook and similar sites
// @icon         https://www.google.com/s2/favicons?sz=64&domain=goldenaudiobooks.com
// @author       mhay10
// @version      0.1.1
// @namespace    https://github.com/mhay10/custom-userscripts
// @license      MIT; https://opensource.org/licenses/MIT
// @match        https://goldenaudiobooks.com/*
// @match        https://appaudiobooks.com/*
// @match        https://bookaudiobooks.com/*
// @match        https://fulllengthaudiobooks.com/*
// @match        https://hotaudiobooks.com/*
// @require      https://cdn.jsdelivr.net/npm/file-saver@2.0.5/dist/FileSaver.min.js
// @require      https://cdn.jsdelivr.net/npm/fflate@0.8.2/umd/index.min.js
// @require      https://cdn.jsdelivr.net/npm/async@3.2.6/dist/async.min.js
// @resource     UI_HTML https://cdn.jsdelivr.net/gh/mhay10/custom-userscripts@latest/goldenaudiobookdownloader/goldenaudiobookdownloader.html
// @resource     BOOTSTRAP_CSS https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css
// @grant        GM_xmlhttpRequest
// @grant        GM_getResourceText
// @grant        GM_addStyle
// @connect      *
// @run-at       document-end
// ==/UserScript==

/**
 * Configuration settings for the userscript
 * @typedef {Object} Config
 * @property {string} filePrefix - Prefix for track filenames in the ZIP
 * @property {string} fallbackZipName - Default ZIP filename if title cannot be parsed
 * @property {PageUI} pageUI - UI selectors for page elements
 * @property {CustomUI} customUI - UI selectors for custom injected elements
 */

/**
 * Page UI selectors
 * @typedef {Object} PageUI
 * @property {string} coverSelector - CSS selector for the book cover element
 * @property {string} audioSelector - CSS selector for audio elements on the page
 */

/**
 * Custom UI selectors
 * @typedef {Object} CustomUI
 * @property {string} downloadButtonSelector - CSS selector for the download button
 * @property {string} instructionSelector - CSS selector for instruction text element
 * @property {string} progressSelector - CSS selector for current progress display
 * @property {string} progressTotalSelector - CSS selector for total progress display
 * @property {string} progressBarSelector - CSS selector for main progress bar
 * @property {string} concProgressBarSelector - CSS selector for concurrent download progress bars
 * @property {string} concProgressPercentSelector - CSS selector for concurrent download percentage text
 */

/**
 * Download slot object for tracking concurrent downloads
 * @typedef {Object} DownloadSlot
 * @property {HTMLElement} progressBarElem - Progress bar element
 * @property {HTMLElement} percentElem - Percentage text element
 */

/** @type {Config} */
// Configuration Settings
const config = {
    // File Name Options
    filePrefix: "track_",
    fallbackZipName: "audiobook.zip",

    // UI Selectors
    pageUI: {
        coverSelector: ".wp-caption.aligncenter",
        audioSelector: "audio.wp-audio-shortcode",
    },
    customUI: {
        downloadButtonSelector: "#download-btn",
        instructionSelector: "#instruction",
        progressSelector: "#progress",
        progressTotalSelector: "#progress-total",
        progressBarSelector: "#progress-bar",
        concProgressBarSelector: ".conc-progress-bar",
        concProgressPercentSelector: ".conc-progress-percent",
    },
};

/** @type {DownloadSlot[]} */
// Cached download slot elements
let downloadSlots = [];

/**
 * Main entry point - initializes the userscript functionality.
 * @async
 * @function
 * @returns {Promise<void>}
 */
(async function () {
    "use strict";

    // Inject Bootstrap into DOM
    injectBootstrap();
    console.log("Injected Boostrap CSS");

    // Wait for page to finish loading
    if (document.readyState === "loading") {
        await new Promise(function (resolve) {
            document.addEventListener("DOMContentLoaded", resolve, {
                once: false,
            });
        });
    }
    console.log("Page fully loaded");

    // Inject the UI into DOM
    injectUserInterface();
    console.log("Custom UI injected");

    // Start download when button is clicked
    const downloadButton = document.querySelector(
        config.customUI.downloadButtonSelector,
    );
    downloadButton.addEventListener("click", async function () {
        // Prevent multiple clicks
        if (downloadButton.getAttribute("data-status") === "ready") {
            downloadButton.setAttribute("data-status", "downloading");
        } else {
            return;
        }
        console.log("Audiobook download started");

        // Get audio source URLs
        const audioElems = [
            ...document.querySelectorAll(config.pageUI.audioSelector),
        ];
        const trackUrls = audioElems.map(function (audioElem) {
            return audioElem.src;
        });
        console.log(`Found ${trackUrls.length} track urls`);

        // Create and save zip archive from files
        updateProgress("Downloading...", 0, trackUrls.length);
        const zip = await createZipBlob(trackUrls);
        saveAs(new Blob([zip]), getZipFilename(trackUrls[0]));

        // Reset download button
        updateProgress("---", "-", "-");
        downloadButton.setAttribute("data-status", "ready");
    });
})();

/**
 * Creates a ZIP blob containing all downloaded audio tracks.
 * @async
 * @function
 * @param {string[]} trackUrls - Array of audio track URLs to download.
 * @returns {Promise<Uint8Array>} ZIP file as a Uint8Array.
 */
async function createZipBlob(trackUrls) {
    // Create files object by downloading each track
    const folder = getZipFilename(trackUrls[0]).replace(".zip", "");
    const files = {};

    // Keep track of free download slots
    const freeSlots = downloadSlots.map(function (_, index) {
        return index;
    });

    // Download audio tracks with limited concurrency
    let numDownloaded = 0;
    await async.forEachOfLimit(trackUrls, 3, async function (trackUrl, index) {
        // Get next free download slot
        const slot = freeSlots.shift();

        // Download audio track and store data
        const response = await downloadAudioTrack(trackUrl, slot);
        files[`${folder}/${config.filePrefix}${index + 1}.mp3`] =
            new Uint8Array(response.response);

        // Free download slot
        freeSlots.push(slot);

        // Update download progress
        numDownloaded++;
        updateProgress("Downloading...", numDownloaded, trackUrls.length);
    });

    // Create zip archive from files
    return fflate.zipSync(files, { level: 0 });
}

/**
 * Downloads a single audio track using GM_xmlhttpRequest.
 * @async
 * @function
 * @param {string} trackUrl - URL of the audio track to download.
 * @param {number} slot - Index of the download slot for progress tracking.
 * @returns {Promise<Object>} Response object containing the audio data.
 */
async function downloadAudioTrack(trackUrl, slot) {
    return new Promise(function (resolve) {
        GM_xmlhttpRequest({
            method: "GET",
            url: trackUrl,
            responseType: "arraybuffer",
            headers: {
                Referer: window.location.href,
                Range: "bytes=0-",
            },

            // Handle while data is being fetched
            onprogress(progress) {
                // Update download slot progress bar
                updateDownloadSlot(slot, progress);
            },

            // Handle once all data fetched
            onload(response) {
                // Resolve promise with audio data
                resolve(response);
            },
        });
    });
}

/**
 * Updates the progress display for a specific download slot.
 * @function
 * @param {number} slot - Index of the download slot to update.
 * @param {Object} progress - Progress event object with loaded and total bytes.
 */
function updateDownloadSlot(slot, progress) {
    // Check that slot is within bounds
    if (slot < 0 || slot >= downloadSlots.length) {
        return;
    }

    // Get slot and percentage
    const { progressBarElem, percentElem } = downloadSlots[slot];

    // Calculate completion percentage
    const percent =
        progress.total > 0
            ? Math.round((progress.loaded / progress.total) * 100)
            : 0;

    // Update progress display
    percentElem.textContent = `${percent}%`;
    progressBarElem.style.width = `${percent}%`;
    progressBarElem.setAttribute("aria-valuenow", percent);
}

/**
 * Updates the main progress bar and text display.
 * @function
 * @param {string} instruction - Instruction text to display.
 * @param {number|string} current - Current progress value.
 * @param {number|string} total - Total progress value.
 */
function updateProgress(instruction, current, total) {
    // Get progress elements
    const instructionElem = document.querySelector(
        config.customUI.instructionSelector,
    );
    const progressElem = document.querySelector(
        config.customUI.progressSelector,
    );
    const progressTotalElem = document.querySelector(
        config.customUI.progressTotalSelector,
    );
    const progressBarElem = document.querySelector(
        config.customUI.progressBarSelector,
    );

    // Update progress text
    instructionElem.textContent = instruction;
    progressElem.textContent = current;
    progressTotalElem.textContent = total;

    // Calculate completion percentage
    const percent = total > 0 ? (current / total) * 100 : 0;

    // Update progress bar
    progressBarElem.style.width = `${percent}%`;
    progressBarElem.setAttribute("aria-valuenow", current);
    progressBarElem.setAttribute("aria-valuemin", 0);
    progressBarElem.setAttribute("aria-valuemax", total);
}

/**
 * Parses and returns the ZIP filename from a track URL.
 * @function
 * @param {string} trackUrl - URL of an audio track.
 * @returns {string} Filename for the ZIP archive.
 */
function getZipFilename(trackUrl) {
    // Parse audiobook title from track url
    const match = trackUrl.match(/uploads\/.+?\/(.+?)\//);

    // Return formatted filename
    if (match && match[1]) {
        const filename = decodeURIComponent(match[1]).replace(/\s+/g, "_");
        return `${filename}.zip`;
    }
    // Fallback filename
    return config.fallbackZipName;
}

/**
 * Injects Bootstrap CSS into the page using GM_addStyle.
 * @function
 */
function injectBootstrap() {
    // Inject using Userscript functions
    const css = GM_getResourceText("BOOTSTRAP_CSS");
    GM_addStyle(css);
}

/**
 * Injects the custom user interface into the page after the book cover.
 * Also caches download slot elements for progress tracking.
 * @function
 */
function injectUserInterface() {
    // Inject after book cover container
    const html = GM_getResourceText("UI_HTML");
    const cover = document.querySelector(config.pageUI.coverSelector);
    cover.insertAdjacentHTML("afterend", html);

    // Cache download slot elements
    const progressBarElems = document.querySelectorAll(
        config.customUI.concProgressBarSelector,
    );
    const percentElems = document.querySelectorAll(
        config.customUI.concProgressPercentSelector,
    );
    downloadSlots = [...progressBarElems].map(
        function (progressBarElem, index) {
            return { progressBarElem, percentElem: percentElems[index] };
        },
    );
}
