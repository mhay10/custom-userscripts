export function createLogger(name: string) {
    return {
        info: (...args: any[]) =>
            { console.log(`%c[${name}]%c`, "color: #74e4ee", "", ...args); },
        error: (...args: any[]) =>
            { console.log(`%c[${name}]%c`, "color: #ee3b60", "", ...args); },
        debug: (...args: any[]) =>
            { console.log(`%c[${name}]%c`, "collor: #8f8f8f", "", ...args); },
    };
}
