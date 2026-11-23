import { LOGGER } from "../logger";

export async function getTrackUrls(tracks: NodeListOf<Element>): Promise<string[]> {
    // Loop through tracks and wait for the audio to load
    const trackUrls: string[] = [];
    for (let [i, track] of tracks.entries()) {
        // Load track url by simulating mouse click
        LOGGER.debug(`Loading track ${i + 1}/${tracks.length}`);
        (track as HTMLElement).click();

        // Wait for track url to finish loading
        trackUrls.push(await waitForTrackLoad(track));
        // TODO: Update progress
    }

    // Skip first track (it's promotional)
    trackUrls.shift();

    LOGGER.debug(`Loaded ${trackUrls.length} track urls`);
    return trackUrls;
}

async function waitForTrackLoad(track: Element): Promise<string> {
    return new Promise((resolve, reject) => {
        // Create mutation observer for audio element
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                // Check if audio's source changed
                if (mutation.type === "attributes" && mutation.attributeName == "data-src") {
                    // Stop observing DOM if source changed
                    observer.disconnect();

                    // Resolve or reject promise if loaded a url
                    const trackUrl = track.getAttribute("data-src");
                    if (trackUrl) {
                        resolve(trackUrl);
                    } else {
                        reject("No audio source loaded");
                    }
                }
            }
        });

        // Start observing track for changes
        observer.observe(track, {
            attributes: true,
            attributeOldValue: true,
        });
    });
}
