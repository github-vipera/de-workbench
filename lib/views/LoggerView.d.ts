import { LoggerListener, LogLevel } from '../logger/Logger';
export declare class LoggerView implements LoggerListener {
    private element;
    private events;
    private panel;
    private item;
    private atomWorkspace;
    private loggerComponent;
    constructor();
    bindWithLogger(): void;
    onLogging(level: LogLevel, msg: string): void;
    /**
     * Initialize the UI
     */
    initUI(): void;
    /**
     * Open this view
     */
    open(): void;
    /**
     * close this view
     */
    close(): void;
}
