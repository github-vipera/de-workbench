'use babel';
/*!
 * Dynamic Engine Workbench
 * Copyright(c) 2017 Dynamic Engine Team @ Vipera Plc
 * MIT Licensed
 */
import { createText, createElement } from '../../element/index';
import { UIPane } from '../../ui-components/UIPane';
export class DebugAreaView extends UIPane {
    constructor(params) {
        super(params);
    }
    /**
     * Initialize the UI
     */
    createUI() {
        // Create the main UI
        let element = createElement('div', {
            elements: [
                createText("Debug Area")
            ]
        });
        return element;
    }
}
//# sourceMappingURL=DebugAreaView0.js.map