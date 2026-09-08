import { config } from './config.js';
import { updateDownloadProgress } from './ui.js';

/**
 * Download an audio track using GM_xmlhttpRequest
 * @param trackUrl - The URL of the track to download
 * @param slotIndex - The slot index for progress tracking
 * @returns Promise resolving with the response
 */
export function downloadAudioTrack(
  trackUrl: string,
  slotIndex = 0
): Promise<GM.Response<any>> {
  return new Promise((resolve) => {
    GM_xmlhttpRequest({
      method: 'GET',
      url: trackUrl,
      responseType: 'arraybuffer',
      headers: {
        Referer: window.location.href,
        Range: 'bytes=0-',
      },
      onprogress: (progress) => {
        updateDownloadProgress(slotIndex, {
          loaded: progress.loaded,
          total: progress.total,
        });
      },
      onload: (response) => {
        // Set progress to 100% on completion
        updateDownloadProgress(slotIndex, { loaded: 1, total: 1 });
        resolve(response);
      },
    });
  });
}

/**
 * Get the ZIP filename from a track URL
 * @param trackUrl - The track URL to parse
 * @returns The formatted filename
 */
export function getZipFilename(trackUrl: string): string {
  const match = trackUrl.match(/audio\/(.*?)\/\d/);
  if (match && match[1]) {
    return `${match[1]}.zip`;
  }
  return config.fallbackZipName;
}
