// ==UserScript==
// @name         Download GoldenAudiobook audiobooks
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
// @resource     UI_HTML https://raw.githack.com/mhay10/custom-userscripts/main/goldenaudiobookdownloader/goldenaudiobookdownloader.html
// @grant        GM_xmlhttpRequest
// @connect      *
// ==/UserScript==

// Configuration Settings
const config = {
	// File Name Options
	filePrefix: "track_",
	fallbackZipName: "audiobook.zip",

	// UI Selectors
	pageUI: {
		audioSelector: "audio.wp-audio-shortcode"
	}
}


(async function () {
	"use strict";

	// Get audio elements and inject custom UI above
	const audioElements = document.querySelectorAll(config.pageUi.audioSelector);
	if (audioElements.length > 0) {
		injectUserInterface(audioElements[0])
	}

})();

function injectUserInterface(audioElement) {
	// Inject above above given audio element
	const html = GM_getResourceText("UI_HTML")
}