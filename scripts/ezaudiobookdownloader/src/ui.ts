import { config } from './config.js';

/**
 * Update the main progress display
 * @param instruction - The current instruction text
 * @param current - Current progress value
 * @param total - Total progress value
 */
export function updateProgress(
  instruction: string,
  current: number | string,
  total: number | string
): void {
  const instructionElem = document.querySelector(
    config.customUi.instructionSelector
  ) as HTMLElement;
  const progressElem = document.querySelector(
    config.customUi.currentProgressSelector
  ) as HTMLElement;
  const progressTotalElem = document.querySelector(
    config.customUi.totalProgressSelector
  ) as HTMLElement;
  const progressBarElem = document.querySelector(
    config.customUi.mainProgressSelector
  ) as HTMLProgressElement;

  if (instructionElem) {instructionElem.textContent = instruction;}
  if (progressElem) {progressElem.textContent = String(current);}
  if (progressTotalElem) {progressTotalElem.textContent = String(total);}
  if (progressBarElem) {
    progressBarElem.value = typeof current === 'number' ? current : 0;
    progressBarElem.max = typeof total === 'number' ? total : 1;
  }
}

/**
 * Update download progress for a specific slot
 * @param slotIndex - The slot index to update
 * @param progress - Progress object with loaded and total bytes
 */
export function updateDownloadProgress(
  slotIndex: number,
  progress: { loaded: number; total: number }
): void {
  const progressRows = document.querySelectorAll(
    config.customUi.downloadProgressBarRowSelector
  );

  if (slotIndex < 0 || slotIndex >= progressRows.length) {
    return;
  }

  const percentage =
    progress.total > 0
      ? Math.round((progress.loaded / progress.total) * 100)
      : 0;

  const row = progressRows[slotIndex];
  const percentElem = row.querySelector(
    config.customUi.downloadProgressPercentSelector
  ) as HTMLElement;
  const progressBar = row.querySelector(
    config.customUi.downloadProgressBarSelector
  ) as HTMLProgressElement;

  if (percentElem) {percentElem.textContent = `${percentage}%`;}
  if (progressBar) {progressBar.value = percentage;}
}

/**
 * Inject the custom UI into the page
 * @param player - The player element to inject UI into
 */
export function injectUserInterface(player: Element): void {
  const html = GM_getResourceText('UI_HTML');
  const errorContainer = player.querySelector('.error-report');
  if (errorContainer) {
    errorContainer.insertAdjacentHTML('afterbegin', html);
  }
}
