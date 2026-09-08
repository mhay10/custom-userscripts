/**
 * Configuration settings for EzAudiobooksForSoul Downloader
 */
export const config = {
  // File Naming Options
  filePrefix: "chapter_",
  fallbackZipName: "audiobook.zip",

  // UI Selectors
  pageUi: {
    playerSelector: "#audio_content",
    audioSelector: "#audio",
    playlistSelector: ".simp-playlist",
    trackSelector: ".simp-source",
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
    downloadProgressBarRowSelector: ".dl-progress-row",
  },
};
