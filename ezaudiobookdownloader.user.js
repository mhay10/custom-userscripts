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
// @grant        GM_xmlhttpRequest
//
// @updateURL    https://github.com/mhay10/custom-userscripts/raw/main/ezaudiobookdownloader.user.js
// @downloadURL  https://github.com/mhay10/custom-userscripts/raw/main/ezaudiobookdownloader.user.js
//
// @require      https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js
// @require      https://cdn.jsdelivr.net/npm/observable-slim@0.2.2/dist/observable-slim.umd.min.js
// ==/UserScript==

(async function () {
    "use strict";

    // Wait for loading to finish
    console.log("Waiting for loading to finish...");
    await waitForLoadFinish();
    console.log("Loading finished. Starting...");

    // Get track elements from playlist
    const player = document.querySelector("#audio_content");
    const playlist = player.querySelector(".simp-playlist");
    const trackElements = playlist.querySelectorAll(".simp-source");

    // Iterate through tracks and wait for audio to load
    const trackUrls = [];
    for (const track of trackElements) {
        // Load track url by simulating click
        track.click();
        await waitForAudioLoad(track);

        // Get track url
        const trackUrl = track.getAttribute("data-src");
        trackUrls.push(trackUrl);
    }
    trackUrls.shift();
    console.log("Number of tracks found:", trackUrls.length);

    // Download each track
    const audioResponses = [];
    for (let i = 0; i < trackUrls.length; i++) {
        console.log(`Downloads track ${i + 1} / ${trackUrls.length}`);
        downloadAudioTrack(trackUrls[i]);
    }
})();

async function downloadAudioTrack(trackUrl) {
    const response = GM_xmlhttpRequest({
        method: "GET",
        url: trackUrl,
        headers: {
            Referer: window.location.href,
            Range: "bytes=0-",
        },
        onload: function (response) {
            console.log("Response received:", response.status);
            console.log("Download complete:", response);
        },
    });
    console.log("Response Code: ", response.status);
}

async function waitForAudioLoad(track) {
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

async function waitForLoadFinish() {
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
