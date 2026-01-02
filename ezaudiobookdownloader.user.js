// ==UserScript==
// @name         Download EzAudiobooksForSoul Audiobooks
// @namespace    https://github.com/mhay10/custom-userscripts
// @version      1.0
// @description  Download audiobooks from EzAudiobooksForSoul
// @author       mhay10
// @match        https://ezaudiobookforsoul.com/audiobook/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=ezaudiobookforsoul.com
// @grant        none
// ==/UserScript==

(async function () {
    "use strict";
});

function injectUserInterface() {
    const player = document.querySelector("#audio_content");
    console.log(player);
}

async function decrypt(encrypted) {
    const response = await fetch(
        `https://ezaudiobookforsoul.com/wp-content/plugins/custom-story-audio/inc/security/decrypt.php?encrypted=${encodeURI}`,
        {
            credentials: "include",
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:146.0) Gecko/20100101 Firefox/146.0",
                Accept: "*/*",
                "Accept-Language": "en-US,en;q=0.5",
                "Alt-Used": "ezaudiobookforsoul.com",
                "Sec-Fetch-Dest": "empty",
                "Sec-Fetch-Mode": "cors",
                "Sec-Fetch-Site": "same-origin",
                "Sec-GPC": "1",
                Priority: "u=0",
            },
            referrer:
                "https://ezaudiobookforsoul.com/audiobook/blood-of-tyrants-audiobook/",
            method: "GET",
            mode: "cors",
        }
    );

    return response;
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
                    const newStyle = mutation.target.getAttribute("style");
                    if (newStyle.includes("display: none")) {
                        console.log("Loading complete, executing script...");
                        observer.disconnect();
                        resolve();
                    }
                }
            }
        });

        observer.observe(document.body, {
            attributes: true,
            attributeOldValue: true,
            subtree: true,
        });
    });
}
