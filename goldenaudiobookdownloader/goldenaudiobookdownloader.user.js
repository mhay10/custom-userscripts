// ==UserScript==
// @name         Download GoldenAudiobook Audiobooks
// @description  Download audiobooks from GoldenAudiobook and similar sites
// @icon         https://www.google.com/s2/favicons?sz=64&domain=goldenaudiobooks.com
// @author       mhay10
// @version      0.1
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

const dev_html = `
<div class="container-sm p-2 border rounded mt-3 mb-3" style="width: 300px">
	<!-- Download Button -->
	<button
		id="download-btn"
		class="btn btn-primary fw-bold w-100"
		data-status="ready"
	>
		Download
	</button>

	<!-- Main Status -->
	<div class="d-flex justify-content-between align-items-center small mt-3">
		<span id="instruction">---</span>
		<span>
			<span id="progress">-</span> / <span id="progress-total">-</span>
		</span>
	</div>

	<!-- Main Progress Bar -->
	<div class="progress mt-2">
		<div
			id="progress-bar"
			class="progress-bar"
			role="progressbar"
			style="width: 0"
			aria-valuemin="0"
			aria-valuemax="100"
		></div>
	</div>

	<!-- Concurrent Download Progress Bars -->
	<div id="download-progress-container" class="mt-3">
		<p class="text-center small fw-bold mb-0 pb-1">File Download Progress</p>
		<div id="download-progress-bars">
			<div class="d-flex align-items-center mb-1">
				<span class="conc-progress-percent small me-2">0%</span>
				<div
					class="progress conc-progress-bar-track"
					style="height: 8px"
				>
					<div
						class="progress-bar conc-progress-bar"
						role="progressbar"
						style="width: 0"
						aria-valuemin="0"
						aria-valuemax="100"
					></div>
				</div>
			</div>
			<div class="d-flex align-items-center mb-1">
				<span class="conc-progress-percent small me-2">0%</span>
				<div
					class="progress conc-progress-bar-track"
					style="height: 8px"
				>
					<div
						class="progress-bar conc-progress-bar"
						role="progressbar"
						style="width: 0"
						aria-valuemin="0"
						aria-valuemax="100"
					></div>
				</div>
			</div>
			<div class="d-flex align-items-center mb-1">
				<span class="conc-progress-percent small me-2">0%</span>
				<div
					class="progress conc-progress-bar-track"
					style="height: 8px"
				>
					<div
						class="progress-bar conc-progress-bar"
						role="progressbar"
						style="width: 0"
						aria-valuemin="0"
						aria-valuemax="100"
					></div>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	#download-btn[data-status="downloading"] {
		background-color: var(--bs-secondary);
		border-color: var(--bs-secondary);
		color: transparent;
		opacity: 0.65;
		position: relative;
		cursor: not-allowed;
		pointer-events: none;
	}

	#download-btn[data-status="downloading"]::after {
		content: "Downloading...";
		color: var(--bs-white);
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
	}

	.conc-progress-percent {
		display: inline-block;
		width: 2.5rem;
		flex-shrink: 0;
		text-align: left;
	}

	.conc-progress-bar-track {
		flex: 1 1 auto;
		min-width: 0;
	}
</style>

`;

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
		concProgressBarSelector: ".conc-progress-bar",
		concProgressPercentSelector: ".conc-progress-percent",
	},
};

// Cached download slot elements
let downloadSlots = [];

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
		const audioElems = [
			...document.querySelectorAll(config.pageUI.audioSelector),
		];
		const trackUrls = audioElems.map(function (audioElem) {
			return audioElem.src;
		});
		console.log(`Found ${trackUrls.length} track urls`);

		// Create and save zip archive from files
		updateProgress("Downloading...", 0, trackUrls.length);
		const zip = await createZipBlob(trackUrls);
		console.log("Zip file created:", zip);

		// Reset download button
		updateProgress("---", "-", "-");
		downloadButton.setAttribute("data-status", "ready");
	});
})();

async function createZipBlob(trackUrls) {
	// Create files object by downloading each track
	const folder = getZipFileName(trackUrls[0]).replace(".zip", "");
	const files = {};

	// Keep track of free download slots
	const freeSlots = downloadSlots.map(function (_, index) {
		return index;
	});

	// Download audio tracks with limited concurrency
	let numDownloaded = 0;
	await async.forEachOfLimit(trackUrls, 3, async function (trackUrl, index) {
		// Get next free download slot
		const slot = freeSlots.shift();

		// Download audio track and store data
		const response = await downloadAudioTrack(trackUrl, slot);
		files[`${folder}/${config.filePrefix}${index + 1}.mp3`] =
			new Uint8Array(response.response);

		// Free download slot
		freeSlots.push(slot);

		// Update download progress
		numDownloaded++;
		updateProgress("Downloading...", numDownloaded, trackUrls.length);
	});

	// Create zip archive from files
	return fflate.zipSync(files, { level: 0 });
}

async function downloadAudioTrack(trackUrl, slot) {
	return new Promise(function (resolve) {
		GM_xmlhttpRequest({
			method: "GET",
			url: trackUrl,
			responseType: "arraybuffer",
			headers: {
				Referer: window.location.href,
				Range: "bytes=0-",
			},

			// Handle while data is being fetched
			onprogress(progress) {
				// Update download slot progress bar
				updateDownloadSlot(slot, progress);
			},

			// Handle once all data fetched
			onload(response) {
				// Resolve promise with audio data
				resolve(response);
			},
		});
	});
}

function updateDownloadSlot(slot, progress) {
	// Check that slot is within bounds
	if (slot < 0 || slot >= downloadSlots.length) {
		return;
	}

	// Get slot and percentage
	const { progressBarElem, percentElem } = downloadSlots[slot];

	// Calculate completion percentage
	const percent =
		progress.total > 0
			? Math.round((progress.loaded / progress.total) * 100)
			: 0;

	// Update progress display
	percentElem.textContent = `${percent}%`;
	progressBarElem.style.width = `${percent}%`;
	progressBarElem.setAttribute("aria-valuenow", percent);
}

function updateProgress(instruction, current, total) {
	// Get progress elements
	const instructionElem = document.querySelector(
		config.customUI.instructionSelector,
	);
	const progressElem = document.querySelector(
		config.customUI.progressSelector,
	);
	const progressTotalElem = document.querySelector(
		config.customUI.progressTotalSelector,
	);
	const progressBarElem = document.querySelector(
		config.customUI.progressBarSelector,
	);

	// Update progress text
	instructionElem.textContent = instruction;
	progressElem.textContent = current;
	progressTotalElem.textContent = total;

	// Calculate completion percentage
	const percent = total > 0 ? (current / total) * 100 : 0;

	// Update progress bar
	progressBarElem.style.width = `${percent}%`;
	progressBarElem.setAttribute("aria-valuenow", current);
	progressBarElem.setAttribute("aria-valuemin", 0);
	progressBarElem.setAttribute("aria-valuemax", total);
}

function getZipFileName(trackUrl) {
	// Parse audiobook title from track url
	const match = trackUrl.match(/uploads\/.+?\/(.+?)\//);

	// Return formatted filename
	if (match && match[1]) {
		const filename = decodeURIComponent(match[1]).replace(" ", "_");
		return `${filename}.zip`;
	}
	// Fallback filename
	return config.fallbackZipName;
}

function injectBootstrap() {
	// Inject using Userscript functions
	const css = GM_getResourceText("BOOTSTRAP_CSS");
	GM_addStyle(css);
}

function injectUserInterface() {
	// Inject after book cover container
	// const html = GM_getResourceText("UI_HTML");
	const cover = document.querySelector(config.pageUI.coverSelector);
	cover.insertAdjacentHTML("afterend", dev_html);

	// Cache download slot elements
	const progressBarElems = document.querySelectorAll(
		config.customUI.concProgressBarSelector,
	);
	const percentElems = document.querySelectorAll(
		config.customUI.concProgressPercentSelector,
	);
	downloadSlots = [...progressBarElems].map(
		function (progressBarElem, index) {
			return { progressBarElem, percentElem: percentElems[index] };
		},
	);
}
