// ==UserScript==
// @name         Download GoldenAudiobook Audiobooks
// @description  Download audiobooks from GoldenAudiobook and similar sites
// @icon         https://www.google.com/s2/favicons?sz=64&domain=goldenaudiobooks.com
// @author       mhay10
// @version      1.3
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
// @resource     UI_HTML https://cdn.jsdelivr.net/gh/mhay10/custom-userscripts@main/goldenaudiobookdownloader/goldenaudiobookdownloader.html
// @resource     BOOTSTRAP_CSS https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css
// @grant        GM_xmlhttpRequest
// @grant        GM_getResourceText
// @grant        GM_addStyle
// @connect      *
// @run-at       document-end
// ==/UserScript==

// Configuration Settings
const config = {
	// File Name Options
	filePrefix: "track_",
	fallbackZipName: "audiobook.zip",

	// UI Selectors
	pageUI: {
		coverSelector: "figure.wp-caption",
		audioSelector: "audio.wp-audio-shortcode",
	},
	customUI: {
		downloadButtonSelector: "#download-btn",
		instructionSelector: "#instruction",
		progressSelector: "#progress",
		progressTotalSelector: "#progress-total",
		progressBarSelector: "#progress-bar",
	},
};

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
		const audioElems = document.querySelectorAll(
			config.pageUI.audioSelector,
		);
		const audioUrls = audioElems.map(function (audioElem) {
			return audioElem.src;
		});

		console.log("Audiobook URLS:", audioUrls);
	});
})();

function injectBootstrap() {
	// Inject using Userscript functions
	const css = GM_getResourceText("BOOTSTRAP_CSS");
	GM_addStyle(css);
}

function injectUserInterface() {
	// Inject after book cover container
	const html = GM_getResourceText("UI_HTML");
	const cover = document.querySelector(config.pageUI.coverSelector);
	cover.insertAdjacentHTML("afterend", html);
}
