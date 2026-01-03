// ==UserScript==
// @name         Download EzAudiobooksForSoul Audiobooks
// @namespace    https://github.com/mhay10/custom-userscripts
// @version      1.0
// @description  Download audiobooks from EzAudiobooksForSoul and similar sites
// @author       mhay10
// @match        https://ezaudiobookforsoul.com/audiobook/*
// @match        https://audiobooks4soul.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=ezaudiobookforsoul.com
// @grant        none
// @updateURL    https://github.com/mhay10/custom-userscripts/raw/main/ezaudiobookdownloader.user.js
// @downloadURL  https://github.com/mhay10/custom-userscripts/raw/main/ezaudiobookdownloader.user.js
// ==/UserScript==

(async function () {
    "use strict";

    // Wait for loading to finish
    console.log("Waiting for loading to finish...");
    await waitForLoadFinish();
    console.log("Loading finished. Starting...");

    // Get track elemnts from playlist
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
    console.log("All track URLs:", trackUrls);
})();

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
                    console.log("Audio loaded:", trackUrl);
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
