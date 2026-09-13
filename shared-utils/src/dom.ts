export function waitForElement<T extends Element>(
    selector: string,
    timeout = 5000,
): Promise<T> {
    return new Promise((resolve, reject) => {
        // Check if element already exists
        const elem = document.querySelector(selector) as T;
        if (elem) { resolve(elem); return; }

        // Create mutation observer to watch for element
        const observer = new MutationObserver(() => {
            const elem = document.querySelector(selector) as T;
            if (elem) {
                observer.disconnect();
                resolve(elem);
            }
        });

        // Start observing document body until timeout is reached
        observer.observe(document.body, { childList: true, subtree: true });
        setTimeout(() => {
            observer.disconnect();
            reject(new Error(`Timeout reached for ${selector}`));
        }, timeout);
    });
}
