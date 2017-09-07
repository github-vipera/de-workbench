'use babel';
/*!
 * Dynamic Engine Workbench
 * Copyright(c) 2017 Dynamic Engine Team @ Vipera Plc
 * MIT Licensed
 */
import { createElement } from '../../element/index';
import { UIPane } from '../../ui-components/UIPane';
export class UIDebugBlock extends UIPane {
    constructor(params) {
        super(params);
    }
    /**
     * Initialize the UI
     */
    createUI() {
        let content = this.createUIBlock();
        // Create the main UI
        let element = createElement('div', {
            elements: [
                content
            ],
            className: 'de-workbench-debug-area-block-container'
        });
        return element;
    }
    createUIBlock() {
        throw ("Invalid implementation. Override this method in subclass.");
    }
}
//# sourceMappingURL=UIDebugBlock.js.map