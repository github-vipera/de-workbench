'use babel';
import { createText, createElement } from '../../element/index';
import { UIDebugBlock } from './UIDebugBlock';
export class DebugBreakpointsView extends UIDebugBlock {
    constructor(params) {
        super(params);
    }
    createUIBlock() {
        let el = createElement('div', {
            elements: [createText("Breakpoints")]
        });
        return el;
    }
}
//# sourceMappingURL=DebugBreakpointsView.js.map