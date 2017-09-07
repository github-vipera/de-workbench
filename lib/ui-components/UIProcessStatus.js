'use babel';
/*!
 * Dynamic Engine Workbench
 * Copyright(c) 2017 Dynamic Engine Team @ Vipera Plc
 * MIT Licensed
 */
import { createText, createElement } from '../element/index';
import { UIBaseComponent } from '../ui-components/UIComponent';
const { allowUnsafeEval, allowUnsafeNewFunction } = require('loophole');
export class UIProcessStatus extends UIBaseComponent {
    constructor() {
        super();
        this.initUI();
    }
    initUI() {
        this.chartCanvas = createElement('div', {});
        let button = createElement('button', {
            elements: [createText("Show Chart")],
            className: 'btn'
        });
        button.addEventListener('click', () => {
            allowUnsafeEval(() => allowUnsafeNewFunction(() => this.show()));
        });
        let mainContainer = createElement('div', {
            elements: [
                this.chartCanvas, button
            ]
        });
        this.mainElement = mainContainer;
    }
    show() {
    }
    destroy() {
        super.destroy();
    }
}
//# sourceMappingURL=UIProcessStatus.js.map