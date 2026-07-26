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
// @require      https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css
// @require      https://cdn.jsdelivr.net/npm/file-saver@2.0.5/dist/FileSaver.min.js
// @require      https://cdn.jsdelivr.net/npm/fflate@0.8.2/umd/index.min.js
// @require      https://cdn.jsdelivr.net/npm/async@3.2.6/dist/async.min.js
// @resource     UI_HTML https://cdn.jsdelivr.net/gh/mhay10/custom-userscripts@master/goldenaudiobookdownloader/goldenaudiobookdownloader.html
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
		audioSelector: "audio.wp-audio-shortcode"
	},
};

(async function () {
	"use strict";

	// Wait for page to finish loading
	if (document.readyState === "loading") {
		await new Promise((resolve)  => 
			document.addEventListener("DOMContentLoaded", resolve, { once: true })
		);
	}

	// Get book cover element and inject UI
	const cover = document.querySelector(config.pageUI.coverSelector);
	injectUserInterface(cover);

	//

})();

function injectUserInterface(cover) {
	// Inject into end of container
	const html = GM_getResourceText("UI_HTML");
	cover.insertAdjacentHTML("afterend", html);
	console.log("Injected the HTML");
}