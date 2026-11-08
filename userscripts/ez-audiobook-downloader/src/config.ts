import { Config } from "./types";

export const CONFIG: Config = {
    // File Naming Options
    filePrefix: "chapter_",
    fallbackZipName: "audiobook.zip",

    // UI Selectors
    pageUI: {
        playerSelector: "#audio_content",
        audioSelector: "#audio",
        playlistSelector: ".simp-playlist",
        trackSelector: ".simp-source",
    },
    customUI: {
        downloadButtonSelector: "#download-btn",
        instructionSelector: "#instruction",
        mainProgressSelector: "#progress-bar",
        currentProgressSelector: "#progress",
        totalProgressSelector: "#progress-total",
        downloadProgressContainerSelector: "#download-progress-container",
        downloadProgressPercentSelector: ".conc-progress-percent",
        downloadProgressBarSelector: ".conc-progress-bar",
        downloadProgressBarRowSelector: ".dl-progress-row",
    },
};
