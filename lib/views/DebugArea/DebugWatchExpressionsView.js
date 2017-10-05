'use babel';
import { createText, createElement } from '../../element/index';
import { UIDebugBlock } from './UIDebugBlock';
export class DebugWatchExpressionsView extends UIDebugBlock {
    constructor(params) {
        super(params);
    }
    createUIBlock() {
        let element = createElement('div', {
            elements: [
                createText("Watch Expressions")
            ]
        });
        return element;
    }
}
//# sourceMappingURL=DebugWatchExpressionsView.js.map