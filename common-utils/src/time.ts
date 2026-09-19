export function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export function debounce<T extends (...args: any[]) => any>(
    fn: T,
    ms: number
): (...args: Parameters<T>) => void {
    let timer: ReturnType<typeof setTimeout>;
    return (...args: Parameters<T>) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), ms);
    };
}

export function formatRelativeTime(dateString: string): string {
    try {
        const date = new Date(dateString);

        if (isNaN(date.getTime())) {
            return dateString;
        }

        const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

        if (seconds < 0) return "future";

        const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

        if (seconds < 60) return rtf.format(-Math.round(seconds), "second");
        if (seconds < 3600) return rtf.format(-Math.floor(seconds / 60), "minute");
        if (seconds < 86400) return rtf.format(-Math.floor(seconds / 3600), "hour");
        if (seconds < 604800) return rtf.format(-Math.floor(seconds / 86400), "day");

        return date.toLocaleDateString("en-US", {
            month: "2-digit",
            day: "2-digit",
            year: "numeric",
        });
    } catch {
        return dateString;
    }
}
