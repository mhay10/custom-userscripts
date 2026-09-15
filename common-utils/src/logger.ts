export interface Logger {
    info: (...args: any[]) => void;
    error: (...args: any[]) => void;
    debug: (...args: any[]) => void;
}

// Fixed color for the logger name across all levels
const NAME_COLOR = "#888888";

// Per-level colors applied to the message text
const LEVEL_COLORS = {
    info: "#258beb", // blue
    error: "#dc2626", // red
    debug: "#444444", // dark gray
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
            .map((arg) => (typeof arg === "string" ? arg : JSON.stringify(arg)))
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
