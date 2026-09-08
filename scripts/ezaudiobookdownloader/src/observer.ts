/**
 * Observer utilities for monitoring DOM changes.
 */



/**
 * Wait for an audio track to load by monitoring data-src attribute changes
 * @param track - The track element to observe
 * @returns Promise that resolves with the track URL when loaded
 */
export async function waitForAudioTrackLoad(track: Element): Promise<string> {
  return new Promise((resolve) => {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (
          mutation.type === 'attributes' &&
          mutation.attributeName === 'data-src'
        ) {
          const trackUrl = track.getAttribute('data-src');
          if (trackUrl) {
            observer.disconnect();
            resolve(trackUrl);
          }
        }
      }
    });

    observer.observe(track, {
      attributes: true,
      attributeOldValue: true,
    });
  });
}

/**
 * Wait for the player to finish loading by monitoring the loading message element
 * @returns Promise that resolves when loading is complete
 */
export async function waitForPlayerLoadFinish(): Promise<void> {
  return new Promise((resolve) => {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (
          mutation.type === 'attributes' &&
          mutation.attributeName === 'style' &&
          (mutation.target as HTMLElement).id === 'loading-message-element'
        ) {
          const newStyle = (mutation.target as HTMLElement).getAttribute('style');
          if (newStyle && newStyle.includes('display: none')) {
            observer.disconnect();
            resolve();
          }
        }
      }
    });

    observer.observe(document.body, {
      attributes: true,
      attributeOldValue: true,
      subtree: true,
    });
  });
}
