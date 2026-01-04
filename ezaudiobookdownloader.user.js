// ==UserScript==
// @name         Download EzAudiobooksForSoul Audiobooks
// @description  Download audiobooks from EzAudiobooksForSoul and similar sites
// @icon         https://www.google.com/s2/favicons?sz=64&domain=ezaudiobookforsoul.com
// @author       mhay10
// @version      1.0
// @namespace    https://github.com/mhay10/custom-userscripts
//
// @match        https://ezaudiobookforsoul.com/audiobook/*
// @match        https://audiobooks4soul.com/*-audiobook/*
//
// @updateURL    https://github.com/mhay10/custom-userscripts/raw/main/ezaudiobookdownloader.user.js
// @downloadURL  https://github.com/mhay10/custom-userscripts/raw/main/ezaudiobookdownloader.user.js
//
// @require      https://cdn.jsdelivr.net/npm/file-saver@2.0.5/dist/FileSaver.min.js
// @require      https://cdn.jsdelivr.net/npm/fflate@0.8.2/umd/index.min.js
// @require      https://cdn.jsdelivr.net/npm/async@3.2.6/dist/async.min.js
//
// @grant        GM_xmlhttpRequest
// @connect      *
// ==/UserScript==

(async function () {
    "use strict";

    // Get player element and inject UI
    const player = document.querySelector("#audio_content");
    injectUserInterface(player);

    // Get other useful elements
    const audioElement = player.querySelector("#audio");
    const playlist = player.querySelector(".simp-playlist");
    const trackElements = playlist.querySelectorAll(".simp-source");
    const downloadButton = player.querySelector("#download-btn");

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
    await async.forEachOfLimit(trackUrls, 5, async function (trackUrl, index) {
        // Download audio track
        const trackNum = index + 1;
        const response = await downloadAudioTrack(trackUrl);
        files[`chapter_${trackNum}.mp3`] = new Uint8Array(response.response);
        updateProgress("Downloading...", trackNum, trackUrls.length);
    });

    // Create zip archive from files
    updateProgress(
        "Creating zip archive...",
        trackUrls.length,
        trackUrls.length
    );
    return fflate.zipSync(files, { level: 0 });
}

async function downloadAudioTrack(trackUrl) {
    return new Promise(function (resolve) {
        GM_xmlhttpRequest({
            method: "GET",
            url: trackUrl,
            responseType: "arraybuffer",
            headers: {
                Referer: window.location.href,
                Range: "bytes=0-",
            },
            onload: function (response) {
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
    return "audiobook.zip";
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
    const instructionElem = document.querySelector("#instruction");
    const progressElem = document.querySelector("#progress");
    const progressTotalElem = document.querySelector("#progress-total");
    const progressBarElem = document.querySelector("#progress-bar");

    // Update progress text
    instructionElem.textContent = instruction;
    progressElem.textContent = current;
    progressTotalElem.textContent = total;

    // Update progress bar
    progressBarElem.value = typeof current === "number" ? current : 0;
    progressBarElem.max = typeof total === "number" ? total : 1;
}

function injectUserInterface(player) {
    const html = `
        <div id="download-container">
            <button type="button" id="download-btn" data-status="waiting">Download</button>
            <p class="status">
                <span id="instruction">---</span>
                <span>
                    <span id="progress">-</span>&nbsp;/&nbsp;<span id="progress-total">-</span>
                </span>
            </p>
            <progress id="progress-bar" value="0"></progress>
        </div>`;
    const css = `
        <style>
            #download-container {
                font-family: "Segoe UI", sans-serif;
                background: #ffffff;
                padding: 12px 14px;
                width: 240px;
                border: 1px solid #d0d0d0;
                border-radius: 6px;
                margin: 7px auto 0;
            }
            #download-container button {
                width: 100%;
                padding: 8px 12px;
                border: 1px solid #b5c7ff;
                border-radius: 5px;
                background: #eaf0ff;
                color: #1f3fd6;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
            }
            #download-container button[data-status="waiting"] {
                background: #f5f5f5;
                border-color: #e0e0e0;
                color: transparent;
                cursor: not-allowed;
                opacity: 0.6;
                position: relative;
            }
            #download-container button[data-status="waiting"]::after {
                content: "Waiting...";
                color: #999;
                position: absolute;
                left: 50%;
                top: 50%;
                transform: translate(-50%, -50%);
            }
            #download-container button[data-status="downloading"] {
                background: #eaf0ff;
                border-color: #b5c7ff;
                color: transparent;
                cursor: not-allowed;
                opacity: 0.5;
                position: relative;
                pointer-events: none;
            }
            #download-container button[data-status="downloading"]::after {
                content: "Downloading...";
                color: #1f3fd6;
                position: absolute;
                left: 50%;
                top: 50%;
                transform: translate(-50%, -50%);
            }
            #download-container .status {
                margin: 8px 0 0;
                display: flex;
                justify-content: space-between;
                font-size: 13px;
            }
            #progress-bar {
                width: 100%;
                height: 8px;
                margin-top: 8px;
                border-radius: 4px;
                border: none;
                background-color: #e0e0e0;
                overflow: hidden;
            }
            #progress-bar::-webkit-progress-bar {
                background-color: #e0e0e0;
                border-radius: 4px;
            }
            #progress-bar::-webkit-progress-value {
                background-color: #1f3fd6;
                border-radius: 4px;
                transition: width 0.3s ease;
            }
            #progress-bar::-moz-progress-bar {
                background-color: #1f3fd6;
                border-radius: 4px;
                transition: width 0.3s ease;
            }
        </style>`;

    //Inject in error container
    const errorContainer = player.querySelector(".error-report");
    errorContainer.insertAdjacentHTML("afterbegin", html + css);
}
