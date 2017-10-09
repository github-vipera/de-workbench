export interface CallStackFrame {
    name: string;
    columnNumber: number;
    lineNumber: number;
    filePath: string;
}
export declare type CallStackFrames = Array<CallStackFrame>;
export interface Breakpoint {
    lineNumber: number;
    filePath: string;
    condition: string;
    marker: any;
}
export declare type Breakpoints = Array<Breakpoint>;
