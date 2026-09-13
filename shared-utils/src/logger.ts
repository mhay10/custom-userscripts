export interface Logger {
    info: (...args: any[]) => void;
    error: (...args: any[]) => void;
    debug: (...args: any[]) => void;
}

export function createLogger(name: string): Logger {
    return {
        info: (...args: any[]): void => {
            console.log(`%c[${name}]%c`, "color: #74e4ee", "", ...args);
        },
        error: (...args: any[]): void => {
            console.log(`%c[${name}]%c`, "color: #ee3b60", "", ...args);
        },
        debug: (...args: any[]): void => {
            console.log(`%c[${name}]%c`, "collor: #8f8f8f", "", ...args);
        },
    };
}
