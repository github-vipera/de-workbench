'use babel';
import { createText, createElement } from '../../element/index';
import { UIPane } from '../../ui-components/UIPane';
export class DebugAreaView extends UIPane {
    constructor(uri) {
        super(uri, "Debug Area");
    }
    createUI() {
        let element = createElement('div', {
            elements: [
                createText("Debug Area")
            ]
        });
        return element;
    }
}
//# sourceMappingURL=DebugAreaView.js.map