import { UIBaseComponent } from './UIComponent';
import { LogLevel } from '../logger/Logger';
export interface LogLine {
    logLevel: LogLevel;
    message: string;
}
export interface LogModelListener {
    rowAppended(newLine: LogLine): void;
    rowDropped(logLine: LogLine, index?: number): void;
    rowsChanged(): void;
}
export interface LogModel {
    appendLogLine(logLine: LogLine): void;
    getRowAt(index: number): LogLine;
    getRowCount(): number;
    addListener(listener: LogModelListener): void;
    removeListener(listener: LogModelListener): void;
    clear(): void;
}
export declare class BaseLogModel implements LogModel {
    private listeners;
    private logLines;
    private maxLineCount;
    constructor(maxLineCount?: number);
    appendLogLine(logLine: LogLine): void;
    getRowCount(): number;
    getRowAt(index: number): LogLine;
    addListener(listener: LogModelListener): void;
    removeListener(listener: LogModelListener): void;
    clear(): void;
    fireRowAdd(logLine: LogLine): void;
    fireRowDrop(logLine: LogLine, index?: number): void;
    fireRowChanges(): void;
}
export interface Filter<T> {
    evaluateFilter(value: T): boolean;
}
export interface IFilterableModel {
    addFilter(filter: Filter<LogLine>): any;
    removeFilter(filter: Filter<LogLine>): any;
    clearAllFilters(): any;
    evaluateAllFilters(): any;
}
export declare class FilterableLogModel extends BaseLogModel implements IFilterableModel, LogModelListener {
    private model;
    private _listeners;
    private _logLines;
    private _filters;
    private _filteredList;
    constructor(model: LogModel);
    appendLogLine(logLine: LogLine): void;
    getRowCount(): number;
    getRowAt(index: number): LogLine;
    addListener(listener: LogModelListener): void;
    removeListener(listener: LogModelListener): void;
    rowAppended(logLine: LogLine): void;
    rowDropped(line: LogLine): void;
    clear(): void;
    rowsChanged(): void;
    addFilter(filter: Filter<LogLine>): void;
    removeFilter(filter: Filter<LogLine>): void;
    clearAllFilters(): void;
    evaluateAllFilters(): void;
    private getOrigialValues();
    private applyFilterChain(currentValues);
}
export declare class UILogView extends UIBaseComponent implements LogModelListener {
    private model;
    private autoscroll;
    constructor(model?: LogModel);
    private initUI();
    isAutoscroll(): boolean;
    setAutoscroll(value: boolean): void;
    private appendNewNode(newLine);
    updateScroll(force?: boolean): void;
    getClassByLevel(level: LogLevel): string;
    rowAppended(newLine: LogLine): void;
    rowDropped(line: LogLine): void;
    rowsChanged(): void;
    private render();
    private clearMainElement();
    private createLogLineElement(message, className?);
}
export declare class UILoggerComponent extends UIBaseComponent {
    readonly autoscroll: boolean;
    private toolbar;
    private logView;
    private logModel;
    constructor(showToolbar?: boolean);
    getFilterableModel(): FilterableLogModel;
    private buildUI(showToolbar);
    addLog(message: string, level?: LogLevel): UILoggerComponent;
    private static getFormattedTimestamp();
    updateScroll(): UILoggerComponent;
    setAutoscroll(autoscroll: boolean): UILoggerComponent;
}
