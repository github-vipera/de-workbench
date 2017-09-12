export declare class Logger {
    private static instance;
    private logger;
    private constructor();
    static getInstance(): Logger;
    info(...msg: any[]): void;
    debug(...msg: any[]): void;
    error(...msg: any[]): void;
}
