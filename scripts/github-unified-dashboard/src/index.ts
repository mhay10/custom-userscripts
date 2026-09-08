/**
 * Main entry point for the GitHub Unified Dashboard script.
 */

import { config, log, error } from './config';
import { setIsInitialized, isInitialized } from './state';
import { createObserver, observeElement, waitForElement } from './observer';
import { initUnifiedFeed } from './features/unified-feed';

/**
 * Inject custom styles for the unified dashboard.
 */
function injectStyles(): void {
  if (typeof GM_addStyle !== 'undefined') {
    GM_addStyle(`
      .unified-feed-badge {
        margin-left: 8px;
        color: #58a6ff;
        font-weight: bold;
      }
      
      .unified-dashboard-enhanced {
        background: linear-gradient(180deg, rgba(88,166,255,0.1) 0%, transparent 100%);
        border-radius: 6px;
        padding: 8px;
      }
    `);
  }
}

/**
 * Initialize the dashboard enhancements.
 */
async function initializeDashboard(): Promise<void> {
  if (isInitialized()) {
    log('Already initialized');
    return;
  }

  try {
    log('Initializing GitHub Unified Dashboard...');

    // Wait for the dashboard container
    const dashboard = await waitForElement(config.dashboardSelector);
    log('Dashboard container found:', dashboard);

    // Inject styles
    injectStyles();

    // Initialize the unified feed feature
    initUnifiedFeed(dashboard);

    // Set up observer for dynamic content
    const observer = createObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length > 0) {
          log('New nodes added, re-initializing feed');
          initUnifiedFeed(dashboard);
        }
      });
    });

    const feedContainer = dashboard.querySelector(config.feedSelector);
    if (feedContainer) {
      observeElement(observer, feedContainer);
    }

    // Store observer reference for cleanup
    // state.observer = observer;

    setIsInitialized(true);
    log('GitHub Unified Dashboard initialized successfully!');
  } catch (e) {
    error('Failed to initialize dashboard:', e);
  }
}

/**
 * Main export - called from the bundled entry point.
 */
export function initDashboard(): void {
  // Check if we're on the dashboard page
  if (!document.querySelector(config.dashboardSelector)) {
    log('Not on dashboard page, skipping initialization');
    return;
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeDashboard);
  } else {
    initializeDashboard();
  }
}

// Auto-execute if this is the main bundle
if (typeof window !== 'undefined') {
  initDashboard();
}
