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
