import { config } from './config.js';
import { updateDownloadSlot } from './ui.js';

/**
 * Download an audio track using GM_xmlhttpRequest
 * @param trackUrl - The URL of the track to download
 * @param slot - The slot index for progress tracking
 * @returns Promise resolving with the response
 */
export function downloadAudioTrack(
  trackUrl: string,
  slot: number
): Promise<GM.Response<unknown>> {
  return new Promise((resolve) => {
    GM_xmlhttpRequest({
      method: 'GET',
      url: trackUrl,
      responseType: 'arraybuffer',
      headers: {
        Referer: window.location.href,
        Range: 'bytes=0-',
      },
      onprogress(progress) {
        updateDownloadSlot(slot, {
          loaded: progress.loaded,
          total: progress.total,
        });
      },
      onload(response) {
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
  const match = trackUrl.match(/uploads\/.+?\/(.+?)\//);
  if (match && match[1]) {
    const filename = decodeURIComponent(match[1]).replace(/\s+/g, '_');
    return `${filename}.zip`;
  }
  return config.fallbackZipName;
}
