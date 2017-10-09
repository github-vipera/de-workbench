import { UIDebugBlock } from './UIDebugBlock';
import { CallStackFrame, CallStackFrames } from '../../DEWorkbench/debugger/DebuggerCommons';
export declare class DebugCallStackView extends UIDebugBlock {
    private toolbar;
    private callStackContentElement;
    constructor(params: any);
    protected createUIBlock(): HTMLElement;
    insertCallStackFromFrames(frames: CallStackFrames): void;
    clearCallStack(): void;
    createFrameLine(frame: CallStackFrame, indicate: boolean): any;
}
