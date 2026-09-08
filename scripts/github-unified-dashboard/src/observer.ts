/**
 * MutationObserver utilities for watching DOM changes.
 */

import { log } from "./config";

export interface ObserverOptions {
  childList: boolean;
  subtree: boolean;
  attributes?: boolean;
  characterData?: boolean;
}

const defaultOptions: ObserverOptions = {
  childList: true,
  subtree: true,
};

export function createObserver(
  callback: (_mutations: MutationRecord[]) => void,
  _options?: Partial<ObserverOptions>
): MutationObserver {
  const observer = new MutationObserver((mutations) => {
    log("Observer triggered with", mutations.length, "mutations");
    callback(mutations);
  });

  // Options can be used in the future if needed
  void _options;

  return observer;
}

export function observeElement(
  observer: MutationObserver,
  element: Element | null,
  _options?: Partial<ObserverOptions>
): void {
  if (!element) {
    return;
  }

  const opts = { ...defaultOptions, ..._options };
  observer.observe(element, opts);
  log("Observing element", element);
}

export function disconnectObserver(observer: MutationObserver | null): void {
  if (observer) {
    observer.disconnect();
    log("Observer disconnected");
  }
}

/**
 * Wait for an element to appear in the DOM.
 */
export function waitForElement(selector: string, timeout = 10000): Promise<Element> {
  return new Promise((resolve, reject) => {
    const element = document.querySelector(selector);
    if (element) {
      resolve(element);
      return;
    }

    const observer = new MutationObserver((_mutations, obs) => {
      const el = document.querySelector(selector);
      if (el) {
        obs.disconnect();
        resolve(el);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Timeout waiting for element: ${selector}`));
    }, timeout);
  });
}
