// ==UserScript==
// @name         Download EzAudiobooksForSoul Audiobooks
// @description  Download audiobooks from EzAudiobooksForSoul and similar sites
// @icon         https://www.google.com/s2/favicons?sz=64&domain=ezaudiobookforsoul.com
// @author       mhay10
// @version      1.0
// @namespace    https://github.com/mhay10/custom-userscripts
//
// @match        https://ezaudiobookforsoul.com/audiobook/*
// @match        https://audiobooks4soul.com/*
//
// @updateURL    https://raw.githack.com/mhay10/custom-userscripts/main/ezaudiobookdownloader.user.js
// @downloadURL  https://raw.githack.com/mhay10/custom-userscripts/main/ezaudiobookdownloader.user.js
//
// @require      https://cdn.jsdelivr.net/npm/file-saver@2.0.5/dist/FileSaver.min.js
// @require      https://cdn.jsdelivr.net/npm/fflate@0.8.2/umd/index.min.js
// @require      https://cdn.jsdelivr.net/npm/async@3.2.6/dist/async.min.js
//
// @resource     UI_HTML https://raw.githack.com/mhay10/custom-userscripts/main/ezaudiobookdownloader.html
//
// @grant        GM_xmlhttpRequest
// @grant        GM_getResourceText
// @connect      *
// ==/UserScript==

// Configuration settings
const config = {
    // File Naming Options
    filePrefix: "chapter_",
    fallbackZipName: "audiobook.zip",

    // UI Selectors
    pageUi: {
        playerSelector: "#audio_content",
        audioSelector: "#audio",
        playlistSelector: ".simp-playlist",
        trackSelector: ".simp-source",
    },
    customUi: {
        downloadButtonSelector: "#download-btn",
        instructionSelector: "#instruction",
        mainProgressSelector: "#progress-bar",
        currentProgressSelector: "#progress",
        totalProgressSelector: "#progress-total",
        downloadProgressContainerSelector: "#download-progress-container",
        downloadProgressPercentSelector: ".dl-progress-percent",
        downloadProgressBarSelector: ".dl-progress-bar",
    },
};

(async function () {
    "use strict";

    // Get player element and inject UI
    const player = document.querySelector(config.pageUi.playerSelector);
    injectUserInterface(player);

    // Get other useful elements
    const audioElement = player.querySelector(config.pageUi.audioSelector);
    const playlist = player.querySelector(config.pageUi.playlistSelector);
    const trackElements = playlist.querySelectorAll(config.pageUi.trackSelector);
    const downloadButton = player.querySelector(config.customUi.downloadButtonSelector);

    // Enable download button once fully loaded
    await waitForPlayerLoadFinish();
    downloadButton.setAttribute("data-status", "ready");

    // Start download when button is clicked
    downloadButton.addEventListener("click", async function () {
        // Prevent multiple clicks
        if (downloadButton.getAttribute("data-status") == "ready") {
            downloadButton.setAttribute("data-status", "downloading");
        } else {
            return;
        }

        // Get decrypted track urls
        const trackUrls = await decryptTrackUrls(trackElements);

        // Pause audio playback once playing
        audioElement.addEventListener("play", function () {
            audioElement.pause();
        });

        // Create and save zip archive from files
        updateProgress("Downloading...", 0, trackUrls.length);
        const zip = await createZipBlob(trackUrls);
        saveAs(new Blob([zip]), getZipFilename(trackUrls[0]));

        // Reset download button
        updateProgress("---", "-", "-");
        downloadButton.setAttribute("data-status", "ready");
    });
})();

async function decryptTrackUrls(trackElements) {
    // Iterate through tracks and wait for audio to load
    const trackUrls = [];
    for (const [i, track] of trackElements.entries()) {
        // Load track url by simulating click
        track.click();
        await waitForAudioTrackLoad(track);
        updateProgress("Decrypting...", i + 1, trackElements.length);

        // Get track url
        const trackUrl = track.getAttribute("data-src");
        trackUrls.push(trackUrl);
    }

    // Skip first track (promotional)
    trackUrls.shift();

    console.log("Number of tracks found:", trackUrls.length);
    return trackUrls;
}

async function createZipBlob(trackUrls) {
    // Create files object by downloading each track
    const files = {};
    let numDownloaded = 0;
    let activeSlots = []; // Track active download slots
    
    await async.forEachOfLimit(trackUrls, 3, async function (trackUrl, index) {
        // Find available slot
        const slotIndex = activeSlots.findIndex(slot => slot === null || slot === undefined);
        const slot = slotIndex === -1 ? activeSlots.length : slotIndex;
        activeSlots[slot] = index;
        
        // Download audio track with progress tracking
        const response = await downloadAudioTrack(trackUrl, slot);
        files[`${config.filePrefix}${index + 1}.mp3`] = new Uint8Array(response.response);

        // Clear slot and update download progress
        activeSlots[slot] = null;
        numDownloaded++;
        updateProgress("Downloading...", numDownloaded, trackUrls.length);
    });

    // Create zip archive from files
    return fflate.zipSync(files, { level: 0 });
}

async function downloadAudioTrack(trackUrl, slotIndex = 0) {
    return new Promise(function (resolve) {
        GM_xmlhttpRequest({
            method: "GET",
            url: trackUrl,
            responseType: "arraybuffer",
            headers: {
                Referer: window.location.href,
                Range: "bytes=0-",
            },
            onprogress: function (progress) {
                updateDownloadProgress(slotIndex, progress);
            },
            onload: function (response) {
                // Set progress to 100% on completion
                updateDownloadProgress(slotIndex, { loaded: 1, total: 1 });
                resolve(response);
            },
        });
    });
}

function getZipFilename(trackUrl) {
    // Parse audiobook title from track url
    const match = trackUrl.match(/audio\/(.*?)\/\d/);

    // Return formatted filename
    if (match && match[1]) {
        return match[1] + ".zip";
    }
    // Fallback filename
    return config.fallbackZipName;
}

async function waitForAudioTrackLoad(track) {
    return new Promise(function (resolve) {
        // Create mutation observer for audio element
        const observer = new MutationObserver(function (mutations) {
            for (const mutation of mutations) {
                // Check audio element src change
                if (
                    mutation.type == "attributes" &&
                    mutation.attributeName == "data-src"
                ) {
                    // Resolve promise once src is updated
                    const trackUrl = track.getAttribute("data-src");
                    observer.disconnect();
                    resolve(trackUrl);
                }
            }
        });

        // Start observing audio element for changes
        observer.observe(track, {
            attributes: true,
            attributeOldValue: true,
        });
    });
}

async function waitForPlayerLoadFinish() {
    return new Promise(function (resolve) {
        // Create mutation observer for loading element
        const observer = new MutationObserver(function (mutations) {
            for (const mutation of mutations) {
                // Check loading element style change
                if (
                    mutation.type === "attributes" &&
                    mutation.attributeName === "style" &&
                    mutation.target.id == "loading-message-element"
                ) {
                    // Make sure loading message is hidden
                    const newStyle = mutation.target.getAttribute("style");
                    if (newStyle.includes("display: none")) {
                        // Resolve promise and stop observing once loaded
                        observer.disconnect();
                        resolve();
                    }
                }
            }
        });

        // Start observing document body for changes
        observer.observe(document.body, {
            attributes: true,
            attributeOldValue: true,
            subtree: true,
        });
    });
}

function updateProgress(instruction, current, total) {
    // Get progress elements
    const instructionElem = document.querySelector(config.customUi.instructionSelector);
    const progressElem = document.querySelector(config.customUi.currentProgressSelector);
    const progressTotalElem = document.querySelector(config.customUi.totalProgressSelector);
    const progressBarElem = document.querySelector(config.customUi.mainProgressSelector);

    // Update progress text
    instructionElem.textContent = instruction;
    progressElem.textContent = current;
    progressTotalElem.textContent = total;

    // Update progress bar
    progressBarElem.value = typeof current === "number" ? current : 0;
    progressBarElem.max = typeof total === "number" ? total : 1;
}

function updateDownloadProgress(slotIndex, progress) {
    // Get all progress bar elements
    const progressRows = document.querySelectorAll(".dl-progress-row");
    
    // Ensure slot index is within bounds
    if (slotIndex < 0 || slotIndex >= progressRows.length) {
        return;
    }
    
    // Calculate percentage
    const percentage = progress.total > 0 
        ? Math.round((progress.loaded / progress.total) * 100)
        : 0;
    
    // Get specific progress elements for this slot
    const row = progressRows[slotIndex];
    const percentElem = row.querySelector(config.customUi.downloadProgressPercentSelector);
    const progressBar = row.querySelector(config.customUi.downloadProgressBarSelector);
    
    // Update progress display
    percentElem.textContent = `${percentage}%`;
    progressBar.value = percentage;
}

function injectUserInterface(player) {
    //Inject in error container
    const html = GM_getResourceText("UI_HTML");
    const errorContainer = player.querySelector(".error-report");
    errorContainer.insertAdjacentHTML("afterbegin", html);
}
