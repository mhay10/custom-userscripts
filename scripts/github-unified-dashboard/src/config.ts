/**
 * Configuration for the GitHub Unified Dashboard script.
 */

export interface Config {
  /** Enable debug logging */
  debug: boolean;
  /** Maximum number of items to fetch per page */
  itemsPerPage: number;
  /** CSS selector for the dashboard container */
  dashboardSelector: string;
  /** CSS selector for the news feed container */
  feedSelector: string;
}

export const config: Config = {
  debug: true,
  itemsPerPage: 50,
  dashboardSelector: '.dashboard',
  feedSelector: '.news',
};

export function isDebug(): boolean {
  return config.debug;
}

export function log(...args: unknown[]): void {
  if (isDebug()) {
    console.log('[GitHub Unified Dashboard]', ...args);
  }
}

export function error(...args: unknown[]): void {
  console.error('[GitHub Unified Dashboard]', ...args);
}
