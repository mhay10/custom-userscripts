/**
 * Feature: Unified Feed
 * Combines Issues and PRs into a single chronological feed.
 */

import { log, error } from '../config';
import { FeedItem, addItem, getItems } from '../state';

export interface UnifiedFeedOptions {
  containerSelector: string;
}

/**
 * Parse a feed item from a DOM element.
 */
export function parseFeedItem(element: Element): FeedItem | null {
  try {
    const titleEl = element.querySelector('[data-hydro-click] a, .title a');
    const authorEl = element.querySelector('.author a, [data-test-id="lead-issue-author"] a');
    const timeEl = element.querySelector('relative-time, time');

    if (!titleEl || !authorEl) {
      return null;
    }

    const title = titleEl.textContent?.trim() || '';
    const author = authorEl.textContent?.trim() || '';
    const repo = titleEl.href?.split('/').slice(0, 5).join('/') || '';
    const url = titleEl.getAttribute('href') || '';
    const timestamp = timeEl 
      ? new Date((timeEl as HTMLElement).getAttribute('datetime') || Date.now())
      : new Date();

    // Determine type based on icons or classes
    const isPR = element.querySelector('.octicon-git-pull-request') !== null;
    const isIssue = element.querySelector('.octicon-issue-opened') !== null;
    const type: FeedItem['type'] = isPR ? 'pull_request' : isIssue ? 'issue' : 'commit';

    const id = `${type}:${url}`;

    return {
      id,
      type,
      title,
      author,
      repo,
      timestamp,
      url,
      html: element.outerHTML,
    };
  } catch (e) {
    error('Failed to parse feed item:', e);
    return null;
  }
}

/**
 * Collect all feed items from the current page.
 */
export function collectFeedItems(container: Element): FeedItem[] {
  const items: FeedItem[] = [];
  const feedElements = container.querySelectorAll('.news > li, .feed-item');

  feedElements.forEach((el) => {
    const item = parseFeedItem(el);
    if (item) {
      items.push(item);
      addItem(item);
    }
  });

  log(`Collected ${items.length} feed items`);
  return items;
}

/**
 * Render the unified feed.
 */
export function renderUnifiedFeed(container: Element): void {
  const items = getItems();
  
  // TODO: Implement custom rendering logic here
  // For now, we just log the collected items
  log(`Rendering ${items.length} items in unified feed`);
  
  // Example: Add a badge showing total count
  const badge = document.createElement('span');
  badge.className = 'unified-feed-badge';
  badge.textContent = `(${items.length})`;
  badge.style.cssText = 'margin-left: 8px; color: #58a6ff; font-weight: bold;';
  
  const dashboardHeader = container.querySelector('.dashboard-header h2');
  if (dashboardHeader && !dashboardHeader.querySelector('.unified-feed-badge')) {
    dashboardHeader.appendChild(badge);
  }
}

/**
 * Initialize the unified feed feature.
 */
export function initUnifiedFeed(container: Element): void {
  log('Initializing unified feed');
  collectFeedItems(container);
  renderUnifiedFeed(container);
}
