'use babel';
import { createElement } from '../../element/index';
import { UIPane } from '../../ui-components/UIPane';
export class UIDebugBlock extends UIPane {
    constructor(uri) {
        super(uri, "Debug Block");
    }
    createUI() {
        let content = this.createUIBlock();
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