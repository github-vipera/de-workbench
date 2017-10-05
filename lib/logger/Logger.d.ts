export declare class Logger {
    private static instance;
    private logger;
    private evtSupport;
    private constructor();
    static getInstance(): Logger;
    static getLoggerBufferFilePath(): any;
    info(...msg: any[]): void;
    debug(...msg: any[]): void;
    warn(...msg: any[]): void;
    error(...msg: any[]): void;
    private fireLogEvent(level, ...msg);
    addLoggingListener(listener: LoggerListener): void;
}
export interface LoggerListener {
    onLogging(level: LogLevel, msg: string): any;
}
export declare enum LogLevel {
    'TRACE' = 0,
    'DEBUG' = 1,
    'INFO' = 2,
    'WARN' = 3,
    'ERROR' = 4,
}
