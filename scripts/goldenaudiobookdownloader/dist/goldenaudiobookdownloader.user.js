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
"use strict";
(() => {
  // src/config.ts
  var config = {
    // File Name Options
    filePrefix: "track_",
    fallbackZipName: "audiobook.zip",
    // UI Selectors
    pageUI: {
      coverSelector: ".wp-caption.aligncenter",
      audioSelector: "audio.wp-audio-shortcode"
    },
    customUI: {
      downloadButtonSelector: "#download-btn",
      instructionSelector: "#instruction",
      progressSelector: "#progress",
      progressTotalSelector: "#progress-total",
      progressBarSelector: "#progress-bar",
      concProgressBarSelector: ".conc-progress-bar",
      concProgressPercentSelector: ".conc-progress-percent"
    }
  };

  // src/ui.ts
  var downloadSlots = [];
  function initializeDownloadSlots() {
    const progressBarElems = document.querySelectorAll(
      config.customUI.concProgressBarSelector
    );
    const percentElems = document.querySelectorAll(
      config.customUI.concProgressPercentSelector
    );
    downloadSlots = Array.from(progressBarElems).map((progressBarElem, index) => ({
      progressBarElem,
      percentElem: percentElems[index]
    }));
  }
  function updateProgress(instruction, current, total) {
    const instructionElem = document.querySelector(
      config.customUI.instructionSelector
    );
    const progressElem = document.querySelector(
      config.customUI.progressSelector
    );
    const progressTotalElem = document.querySelector(
      config.customUI.progressTotalSelector
    );
    const progressBarElem = document.querySelector(
      config.customUI.progressBarSelector
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
    const percent = typeof total === "number" && total > 0 ? current / total * 100 : 0;
    if (progressBarElem) {
      progressBarElem.style.width = `${percent}%`;
      progressBarElem.setAttribute("aria-valuenow", String(current));
      progressBarElem.setAttribute("aria-valuemin", "0");
      progressBarElem.setAttribute("aria-valuemax", String(total));
    }
  }
  function updateDownloadSlot(slot, progress) {
    if (slot < 0 || slot >= downloadSlots.length) {
      return;
    }
    const { progressBarElem, percentElem } = downloadSlots[slot];
    const percent = progress.total > 0 ? Math.round(progress.loaded / progress.total * 100) : 0;
    percentElem.textContent = `${percent}%`;
    progressBarElem.style.width = `${percent}%`;
    progressBarElem.setAttribute("aria-valuenow", String(percent));
  }
  function injectBootstrap() {
    const css = GM_getResourceText("BOOTSTRAP_CSS");
    GM_addStyle(css);
  }
  function injectUserInterface() {
    const html = GM_getResourceText("UI_HTML");
    const cover = document.querySelector(config.pageUI.coverSelector);
    if (cover) {
      cover.insertAdjacentHTML("afterend", html);
    }
    initializeDownloadSlots();
  }

  // src/downloader.ts
  function downloadAudioTrack(trackUrl, slot) {
    return new Promise((resolve) => {
      GM_xmlhttpRequest({
        method: "GET",
        url: trackUrl,
        responseType: "arraybuffer",
        headers: {
          Referer: window.location.href,
          Range: "bytes=0-"
        },
        onprogress(progress) {
          updateDownloadSlot(slot, {
            loaded: progress.loaded,
            total: progress.total
          });
        },
        onload(response) {
          resolve(response);
        }
      });
    });
  }
  function getZipFilename(trackUrl) {
    const match = trackUrl.match(/uploads\/.+?\/(.+?)\//);
    if (match && match[1]) {
      const filename = decodeURIComponent(match[1]).replace(/\s+/g, "_");
      return `${filename}.zip`;
    }
    return config.fallbackZipName;
  }

  // src/index.ts
  var downloadSlots2 = [];
  async function createZipBlob(trackUrls) {
    const folder = getZipFilename(trackUrls[0]).replace(".zip", "");
    const files = {};
    const freeSlots = downloadSlots2.map((_, index) => index);
    let numDownloaded = 0;
    await async.forEachOfLimit(
      trackUrls,
      3,
      async (trackUrl, index) => {
        const slot = freeSlots.shift() ?? 0;
        const response = await downloadAudioTrack(trackUrl, slot);
        files[`${folder}/${config.filePrefix}${index + 1}.mp3`] = new Uint8Array(
          response.response
        );
        freeSlots.push(slot);
        numDownloaded++;
        updateProgress("Downloading...", numDownloaded, trackUrls.length);
      }
    );
    return fflate.zipSync(files, { level: 0 });
  }
  async function main() {
    "use strict";
    injectBootstrap();
    console.log("Injected Bootstrap CSS");
    if (document.readyState === "loading") {
      await new Promise((resolve) => {
        document.addEventListener(
          "DOMContentLoaded",
          () => resolve(),
          { once: true }
        );
      });
    }
    console.log("Page fully loaded");
    injectUserInterface();
    console.log("Custom UI injected");
    downloadSlots2 = [{ index: 0 }, { index: 1 }, { index: 2 }];
    const downloadButton = document.querySelector(
      config.customUI.downloadButtonSelector
    );
    if (!downloadButton) {
      console.error("Download button not found");
      return;
    }
    downloadButton.addEventListener("click", async () => {
      if (downloadButton.getAttribute("data-status") === "ready") {
        downloadButton.setAttribute("data-status", "downloading");
      } else {
        return;
      }
      console.log("Audiobook download started");
      const audioElems = Array.from(
        document.querySelectorAll(config.pageUI.audioSelector)
      );
      const trackUrls = audioElems.map((audioElem) => audioElem.src);
      console.log(`Found ${trackUrls.length} track urls`);
      updateProgress("Downloading...", 0, trackUrls.length);
      const zip = await createZipBlob(trackUrls);
      saveAs(new Blob([zip]), getZipFilename(trackUrls[0]));
      updateProgress("---", "-", "-");
      downloadButton.setAttribute("data-status", "ready");
    });
  }
  main().catch(console.error);
})();
