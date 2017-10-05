'use babel';
import { createText, createElement } from '../../element/index';
import { UIDebugBlock } from './UIDebugBlock';
export class DebugVariablesView extends UIDebugBlock {
    constructor(params) {
        super(params);
    }
    createUIBlock() {
        let el = createElement('div', {
            elements: [createText("Variables")]
        });
        return el;
    }
}
//# sourceMappingURL=DebugVariablesView.js.map