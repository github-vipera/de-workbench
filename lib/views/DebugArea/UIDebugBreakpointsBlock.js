'use babel';
/*!
 * Dynamic Engine Workbench
 * Copyright(c) 2017 Dynamic Engine Team @ Vipera Plc
 * MIT Licensed
 */
import { createText, createElement } from '../../element/index';
import { UIDebugBlock } from './UIDebugBlock';
export class UIDebugBreakpointsView extends UIDebugBlock {
    constructor(params) {
        super(params);
    }
    /**
     * Initialize the UI
     */
    createUIBlock() {
        let el = createElement('div', {
            elements: [createText("Breakpoints")]
        });
        return el;
    }
}
//# sourceMappingURL=UIDebugBreakpointsBlock.js.map