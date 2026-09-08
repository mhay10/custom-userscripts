/**
 * Configuration settings for GoldenAudiobook Downloader
 */
export const config = {
  // File Name Options
  filePrefix: 'track_',
  fallbackZipName: 'audiobook.zip',

  // UI Selectors
  pageUI: {
    coverSelector: '.wp-caption.aligncenter',
    audioSelector: 'audio.wp-audio-shortcode',
  },
  customUI: {
    downloadButtonSelector: '#download-btn',
    instructionSelector: '#instruction',
    progressSelector: '#progress',
    progressTotalSelector: '#progress-total',
    progressBarSelector: '#progress-bar',
    concProgressBarSelector: '.conc-progress-bar',
    concProgressPercentSelector: '.conc-progress-percent',
  },
};
