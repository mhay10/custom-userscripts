// ==UserScript==
// @name         Download EzAudiobooksForSoul Audiobooks
// @description  Download audiobooks from EzAudiobooksForSoul and similar sites
// @icon         https://www.google.com/s2/favicons?sz=64&domain=ezaudiobookforsoul.com
// @author       mhay10
// @version      1.3
// @namespace    https://github.com/mhay10/custom-userscripts
// @license      MIT; https://opensource.org/licenses/MIT
// @match        https://ezaudiobookforsoul.com/audiobook/*
// @match        https://audiobooks4soul.com/*
// @require      https://cdn.jsdelivr.net/npm/file-saver@2.0.5/dist/FileSaver.min.js
// @require      https://cdn.jsdelivr.net/npm/fflate@0.8.2/umd/index.min.js
// @require      https://cdn.jsdelivr.net/npm/async@3.2.6/dist/async.min.js
// @resource     UI_HTML https://cdn.jsdelivr.net/gh/mhay10/custom-userscripts@latest/ezaudiobookdownloader/ezaudiobookdownloader.html
// @grant        GM_xmlhttpRequest
// @grant        GM_getResourceText
// @connect      *
// ==/UserScript==
"use strict";
(() => {
  // src/config.ts
  var config = {
    // File Naming Options
    filePrefix: "chapter_",
    fallbackZipName: "audiobook.zip",
    // UI Selectors
    pageUi: {
      playerSelector: "#audio_content",
      audioSelector: "#audio",
      playlistSelector: ".simp-playlist",
      trackSelector: ".simp-source"
    },
    customUi: {
      downloadButtonSelector: "#download-btn",
      instructionSelector: "#instruction",
      mainProgressSelector: "#progress-bar",
      currentProgressSelector: "#progress",
      totalProgressSelector: "#progress-total",
      downloadProgressContainerSelector: "#download-progress-container",
      downloadProgressPercentSelector: ".conc-progress-percent",
      downloadProgressBarSelector: ".conc-progress-bar",
      downloadProgressBarRowSelector: ".dl-progress-row"
    }
  };

  // src/observer.ts
  async function waitForAudioTrackLoad(track) {
    return new Promise((resolve) => {
      const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          if (mutation.type === "attributes" && mutation.attributeName === "data-src") {
            const trackUrl = track.getAttribute("data-src");
            if (trackUrl) {
              observer.disconnect();
              resolve(trackUrl);
            }
          }
        }
      });
      observer.observe(track, {
        attributes: true,
        attributeOldValue: true
      });
    });
  }
  async function waitForPlayerLoadFinish() {
    return new Promise((resolve) => {
      const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          if (mutation.type === "attributes" && mutation.attributeName === "style" && mutation.target.id === "loading-message-element") {
            const newStyle = mutation.target.getAttribute("style");
            if (newStyle && newStyle.includes("display: none")) {
              observer.disconnect();
              resolve();
            }
          }
        }
      });
      observer.observe(document.body, {
        attributes: true,
        attributeOldValue: true,
        subtree: true
      });
    });
  }

  // src/ui.ts
  function updateProgress(instruction, current, total) {
    const instructionElem = document.querySelector(
      config.customUi.instructionSelector
    );
    const progressElem = document.querySelector(
      config.customUi.currentProgressSelector
    );
    const progressTotalElem = document.querySelector(
      config.customUi.totalProgressSelector
    );
    const progressBarElem = document.querySelector(
      config.customUi.mainProgressSelector
    );
    if (instructionElem) {
      instructionElem.textContent = instruction;
    }
    if (progressElem) {
      progressElem.textContent = String(current);
    }
    if (progressTotalElem) {
      progressTotalElem.textContent = String(total);
    }
    if (progressBarElem) {
      progressBarElem.value = typeof current === "number" ? current : 0;
      progressBarElem.max = typeof total === "number" ? total : 1;
    }
  }
  function updateDownloadProgress(slotIndex, progress) {
    const progressRows = document.querySelectorAll(
      config.customUi.downloadProgressBarRowSelector
    );
    if (slotIndex < 0 || slotIndex >= progressRows.length) {
      return;
    }
    const percentage = progress.total > 0 ? Math.round(progress.loaded / progress.total * 100) : 0;
    const row = progressRows[slotIndex];
    const percentElem = row.querySelector(
      config.customUi.downloadProgressPercentSelector
    );
    const progressBar = row.querySelector(
      config.customUi.downloadProgressBarSelector
    );
    if (percentElem) {
      percentElem.textContent = `${percentage}%`;
    }
    if (progressBar) {
      progressBar.value = percentage;
    }
  }
  function injectUserInterface(player) {
    const html = GM_getResourceText("UI_HTML");
    const errorContainer = player.querySelector(".error-report");
    if (errorContainer) {
      errorContainer.insertAdjacentHTML("afterbegin", html);
    }
  }

  // src/downloader.ts
  function downloadAudioTrack(trackUrl, slotIndex = 0) {
    return new Promise((resolve) => {
      GM_xmlhttpRequest({
        method: "GET",
        url: trackUrl,
        responseType: "arraybuffer",
        headers: {
          Referer: window.location.href,
          Range: "bytes=0-"
        },
        onprogress: (progress) => {
          updateDownloadProgress(slotIndex, {
            loaded: progress.loaded,
            total: progress.total
          });
        },
        onload: (response) => {
          updateDownloadProgress(slotIndex, { loaded: 1, total: 1 });
          resolve(response);
        }
      });
    });
  }
  function getZipFilename(trackUrl) {
    const match = trackUrl.match(/audio\/(.*?)\/\d/);
    if (match && match[1]) {
      return `${match[1]}.zip`;
    }
    return config.fallbackZipName;
  }

  // src/index.ts
  async function decryptTrackUrls(trackElements) {
    const trackUrls = [];
    for (const [i, track] of trackElements.entries()) {
      track.click();
      await waitForAudioTrackLoad(track);
      updateProgress("Decrypting...", i + 1, trackElements.length);
      const trackUrl = track.getAttribute("data-src");
      if (trackUrl) {
        trackUrls.push(trackUrl);
      }
    }
    trackUrls.shift();
    console.log("Number of tracks found:", trackUrls.length);
    return trackUrls;
  }
  async function createZipBlob(trackUrls) {
    const folder = getZipFilename(trackUrls[0]).replace(".zip", "");
    const files = {};
    let numDownloaded = 0;
    const activeSlots = [];
    await async.forEachOfLimit(
      trackUrls,
      3,
      async (trackUrl, index) => {
        const slotIndex = activeSlots.findIndex(
          (slot2) => slot2 === null || slot2 === void 0
        );
        const slot = slotIndex === -1 ? activeSlots.length : slotIndex;
        activeSlots[slot] = index;
        const response = await downloadAudioTrack(trackUrl, slot);
        files[`${folder}/${config.filePrefix}${index + 1}.mp3`] = new Uint8Array(
          response.response
        );
        activeSlots[slot] = null;
        numDownloaded++;
        updateProgress("Downloading...", numDownloaded, trackUrls.length);
      }
    );
    return fflate.zipSync(files, { level: 0 });
  }
  async function main() {
    "use strict";
    const player = document.querySelector(config.pageUi.playerSelector);
    if (!player) {
      console.error("Player element not found");
      return;
    }
    injectUserInterface(player);
    const audioElement = player.querySelector(
      config.pageUi.audioSelector
    );
    const playlist = player.querySelector(config.pageUi.playlistSelector);
    const trackElements = playlist?.querySelectorAll(config.pageUi.trackSelector);
    const downloadButton = player.querySelector(
      config.customUi.downloadButtonSelector
    );
    if (!trackElements || !downloadButton) {
      console.error("Required elements not found");
      return;
    }
    const trackArray = Array.from(trackElements);
    await waitForPlayerLoadFinish();
    downloadButton.setAttribute("data-status", "ready");
    downloadButton.addEventListener("click", async () => {
      if (downloadButton.getAttribute("data-status") === "ready") {
        downloadButton.setAttribute("data-status", "downloading");
      } else {
        return;
      }
      const trackUrls = await decryptTrackUrls(trackArray);
      audioElement.addEventListener("play", () => {
        audioElement.pause();
      });
      updateProgress("Downloading...", 0, trackUrls.length);
      const zip = await createZipBlob(trackUrls);
      saveAs(new Blob([zip]), getZipFilename(trackUrls[0]));
      updateProgress("---", "-", "-");
      downloadButton.setAttribute("data-status", "ready");
    });
  }
  main().catch(console.error);
})();
