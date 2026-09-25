export interface Logger {
    info: (...args: any[]) => void;
    error: (...args: any[]) => void;
    debug: (...args: any[]) => void;
}

// Fixed color for the logger name across all levels
const NAME_COLOR = "#a78bfa";

// Per-level colors applied to the message text
const LEVEL_COLORS = {
    info: "#38cff8",
    error: "#ef4444",
    debug: "#666666",
} as const;

/**
 * Creates a console logger that prefixes each message with a fixed-color name and level-colored text
 *
 * @param name - Label shown in brackets before every message (e.g. app name and version)
 * @returns A logger with `info`, `error`, and `debug` methods
 */
export function createLogger(name: string): Logger {
    function log(level: keyof typeof LEVEL_COLORS, args: any[]): void {
        const message = args
            .map((arg) => {
                if (typeof arg === "string") return arg;
                if (arg instanceof Error) return arg.message ?? arg.stack;
                return JSON.stringify(arg) ?? String(arg);
            })
            .join(" ");

        console.log(
            `%c[${name}]%c ${message}`,
            `color: ${NAME_COLOR}`,
            `color: ${LEVEL_COLORS[level]}`
        );
    }

    return {
        info: (...args: any[]): void => log("info", args),
        error: (...args: any[]): void => log("error", args),
        debug: (...args: any[]): void => log("debug", args),
    };
}
