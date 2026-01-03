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
// @updateURL    https://github.com/mhay10/custom-userscripts/raw/main/ezaudiobookdownloader.user.js
// @downloadURL  https://github.com/mhay10/custom-userscripts/raw/main/ezaudiobookdownloader.user.js
//
// @require      https://cdn.jsdelivr.net/npm/file-saver@2.0.5/dist/FileSaver.min.js
// @require      https://cdn.jsdelivr.net/npm/fflate@0.8.2/umd/index.min.js
//
// @grant        GM_xmlhttpRequest
// @connect      *
// ==/UserScript==

(async function () {
    "use strict";

    // Wait for loading to finish
    await waitForPlayerLoadFinish();
    console.log("Loading finished. Starting...");

    // Get useful elements from page
    const player = document.querySelector("#audio_content");
    const playlist = player.querySelector(".simp-playlist");
    const audioElement = player.querySelector("#audio");
    const trackElements = playlist.querySelectorAll(".simp-source");

    // Get decrypted track urls
    const trackUrls = await decryptTrackUrls(trackElements);

    // Pause audio playback if playing
    if (!audioElement.paused) {
        audioElement.pause();
        audioElement.play();
        audioElement.pause();
    }

    // Create and save zip archive from files
    console.log("Creating zip archive...");
    const zip = await createZipBlob(trackUrls);
    saveAs(new Blob([zip]), "audiobook.zip");
})();

async function decryptTrackUrls(trackElements) {
    // Iterate through tracks and wait for audio to load
    const trackUrls = [];
    for (const track of trackElements) {
        // Load track url by simulating click
        track.click();
        await waitForAudioTrackLoad(track);

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
    const chunkSize = 5;
    for (let i = 0; i < trackUrls.length; i += chunkSize) {
        // Download 5 tracks at a time
        const chunk = trackUrls.slice(i, i + chunkSize);
        const downloads = await Promise.all(
            chunk.map(function (url) {
                return downloadAudioTrack(url);
            })
        );

        // Add downloaded tracks to files object
        for (let j = 0; j < downloads.length; j++) {
            const trackNum = i + j + 1;
            const response = downloads[j];
            files[`track_${trackNum}.mp3`] = new Uint8Array(response.response);
            console.log(`Downloaded track ${trackNum}/${trackUrls.length}`);
        }
    }

    // Create zip archive from files
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
