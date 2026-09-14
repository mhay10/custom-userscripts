export function waitForElement<T extends Element>(selector: string, timeout = 5000): Promise<T> {
    return new Promise((resolve, reject) => {
        // Check if element already exists
        const elem = document.querySelector(selector) as T;
        if (elem) {
            resolve(elem);
            return;
        }

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

export function getCspNonce(): string | null {
    // Try to get nonce from a meta tag
    const metaTag = document.querySelector('meta[name="csp-nonce"]') as HTMLMetaElement;
    const metaNonce = metaTag?.getAttribute("content");
    if (metaNonce) return metaNonce;

    // Try to get nonce from a script tag
    const scriptTag = document.querySelector("script[nonce]") as HTMLScriptElement;
    const scriptNonce = scriptTag?.nonce;
    if (scriptNonce) return scriptNonce;

    return null;
}
