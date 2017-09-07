'use babel';
/*!
 * Dynamic Engine Workbench
 * Copyright(c) 2017 Dynamic Engine Team @ Vipera Plc
 * MIT Licensed
 */
import { createText, createElement } from '../../element/index';
import { UIDebugBlock } from './UIDebugBlock';
export class DebugWatchExpressionsView extends UIDebugBlock {
    constructor(params) {
        super(params);
    }
    /**
     * Initialize the UI
     */
    createUIBlock() {
        // Create the main UI
        let element = createElement('div', {
            elements: [
                createText("Watch Expressions")
            ]
        });
        return element;
    }
}
//# sourceMappingURL=DebugWatchExpressionsView.js.map