/**
 * State management for the GitHub Unified Dashboard script.
 */

export interface FeedItem {
  id: string;
  type: "issue" | "pull_request" | "commit" | "release";
  title: string;
  author: string;
  repo: string;
  timestamp: Date;
  url: string;
  html?: string;
}

export interface ScriptState {
  /** Whether the script has been initialized */
  initialized: boolean;
  /** Whether we're currently fetching data */
  isLoading: boolean;
  /** Last fetched timestamp for pagination */
  lastFetchedAt: Date | null;
  /** Collected feed items */
  items: FeedItem[];
  /** Observer instance */
  observer: MutationObserver | null;
}

export const state: ScriptState = {
  initialized: false,
  isLoading: false,
  lastFetchedAt: null,
  items: [],
  observer: null,
};

export function isInitialized(): boolean {
  return state.initialized;
}

export function setIsInitialized(value: boolean): void {
  state.initialized = value;
}

export function isLoading(): boolean {
  return state.isLoading;
}

export function setIsLoading(value: boolean): void {
  state.isLoading = value;
}

export function addItem(item: FeedItem): void {
  // Avoid duplicates by ID
  const exists = state.items.some((i) => i.id === item.id);
  if (!exists) {
    state.items.push(item);
  }
}

export function getItems(): FeedItem[] {
  return [...state.items].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

export function clearItems(): void {
  state.items = [];
}
