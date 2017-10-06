import { Breakpoint, Breakpoints } from './DebuggerCommons';
export declare class BreakpointManager {
    private breakpoints;
    constructor();
    getBreakpoints(): Breakpoints;
    getBreakpoint(filePath: String, lineNumber: Number): Breakpoint;
    getBreakpointsFromFile(filePath: String): Breakpoints;
    removeBreakpoint(breakpoint: Breakpoint): Promise<boolean>;
    addBreakpoint(marker: any, lineNumber: number, filePath: string, condition?: string): Promise<Breakpoint>;
    getPlainBreakpoints(): Breakpoints;
}
