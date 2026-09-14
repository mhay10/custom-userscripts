export interface Logger {
    info: (...args: any[]) => void;
    error: (...args: any[]) => void;
    debug: (...args: any[]) => void;
}

// Fixed color for the logger name across all levels
const NAME_COLOR = "#74e4ee";

// Per-level colors applied to the message text
const LEVEL_COLORS = {
    info: "#3b82f6", // blue
    error: "#ee3b60", // red
    debug: "#8f8f8f", // dark gray
} as const;

/**
 * Creates a console logger that prefixes each message with a fixed-color name and level-colored text
 *
 * @param name - Label shown in brackets before every message (e.g. app name and version)
 * @returns A logger with `info`, `error`, and `debug` methods
 */
export function createLogger(name: string): Logger {
    function log(level: keyof typeof LEVEL_COLORS, args: any[]): void {
        console.log(
            `%c[${name}]%c`,
            `color: ${NAME_COLOR}`,
            `color: ${LEVEL_COLORS[level]}`,
            ...args
        );
    }

    return {
        info: (...args: any[]): void => log("info", args),
        error: (...args: any[]): void => log("error", args),
        debug: (...args: any[]): void => log("debug", args),
    };
}
