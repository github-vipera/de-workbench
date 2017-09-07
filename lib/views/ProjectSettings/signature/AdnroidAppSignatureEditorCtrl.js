'use babel';
/*!
 * Dynamic Engine Workbench
 * Copyright(c) 2017 Dynamic Engine Team @ Vipera Plc
 * MIT Licensed
 */
import { createText, createElement } from '../../../element/index';
import { UIBaseComponent } from '../../../ui-components/UIComponent';
export class IOSAppSignatureEditorCtrl extends UIBaseComponent {
    constructor() {
        super();
        this.initUI();
    }
    initUI() {
        let foo = createElement('div', {
            elements: [createText('pippo')]
        });
        this.mainElement = foo;
    }
    destroy() {
        super.destroy();
    }
}
//# sourceMappingURL=AdnroidAppSignatureEditorCtrl.js.map