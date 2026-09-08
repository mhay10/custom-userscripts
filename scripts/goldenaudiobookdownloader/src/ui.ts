import { config } from './config.js';

interface DownloadSlot {
  progressBarElem: HTMLElement;
  percentElem: HTMLElement;
}

let downloadSlots: DownloadSlot[] = [];

/**
 * Initialize download slot elements cache
 */
export function initializeDownloadSlots(): void {
  const progressBarElems = document.querySelectorAll(
    config.customUI.concProgressBarSelector
  );
  const percentElems = document.querySelectorAll(
    config.customUI.concProgressPercentSelector
  );
  downloadSlots = Array.from(progressBarElems).map((progressBarElem, index) => ({
    progressBarElem: progressBarElem as HTMLElement,
    percentElem: percentElems[index] as HTMLElement,
  }));
}

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
    config.customUI.instructionSelector
  ) as HTMLElement;
  const progressElem = document.querySelector(
    config.customUI.progressSelector
  ) as HTMLElement;
  const progressTotalElem = document.querySelector(
    config.customUI.progressTotalSelector
  ) as HTMLElement;
  const progressBarElem = document.querySelector(
    config.customUI.progressBarSelector
  ) as HTMLElement;

  if (instructionElem) {instructionElem.textContent = instruction;}
  if (progressElem) {progressElem.textContent = String(current);}
  if (progressTotalElem) {progressTotalElem.textContent = String(total);}

  // Calculate completion percentage
  const percent =
    typeof total === 'number' && total > 0
      ? ((current as number) / total) * 100
      : 0;

  if (progressBarElem) {
    progressBarElem.style.width = `${percent}%`;
    progressBarElem.setAttribute('aria-valuenow', String(current));
    progressBarElem.setAttribute('aria-valuemin', '0');
    progressBarElem.setAttribute('aria-valuemax', String(total));
  }
}

/**
 * Update a download slot's progress bar
 * @param slot - The slot index to update
 * @param progress - Progress object with loaded and total bytes
 */
export function updateDownloadSlot(
  slot: number,
  progress: { loaded: number; total: number }
): void {
  if (slot < 0 || slot >= downloadSlots.length) {
    return;
  }

  const { progressBarElem, percentElem } = downloadSlots[slot];

  // Calculate completion percentage
  const percent =
    progress.total > 0
      ? Math.round((progress.loaded / progress.total) * 100)
      : 0;

  percentElem.textContent = `${percent}%`;
  progressBarElem.style.width = `${percent}%`;
  progressBarElem.setAttribute('aria-valuenow', String(percent));
}

/**
 * Inject Bootstrap CSS into the page
 */
export function injectBootstrap(): void {
  const css = GM_getResourceText('BOOTSTRAP_CSS');
  GM_addStyle(css);
}

/**
 * Inject the custom UI into the page
 */
export function injectUserInterface(): void {
  const html = GM_getResourceText('UI_HTML');
  const cover = document.querySelector(config.pageUI.coverSelector);
  if (cover) {
    cover.insertAdjacentHTML('afterend', html);
  }

  // Cache download slot elements
  initializeDownloadSlots();
}
