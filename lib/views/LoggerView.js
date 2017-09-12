'use babel';
/*!
 * Dynamic Engine Workbench
 * Copyright(c) 2017 Dynamic Engine Team @ Vipera Plc
 * MIT Licensed
 */
import { createElement, insertElement } from '../element/index';
import { Logger } from '../logger/Logger';
import { UILoggerComponent, FileTailLogModel } from '../ui-components/UILoggerComponent';
import { UIPane } from '../ui-components/UIPane';
export class LoggerView extends UIPane {
    constructor(params) {
        super(params);
    }
    /**
     * Initialize the UI
     */
    createUI() {
        this.logModel = new FileTailLogModel(Logger.getLoggerBufferFilePath(), 10);
        this.loggerComponent = new UILoggerComponent(true, this.logModel);
        // Create the main UI
        let element = createElement('div', {
            elements: []
        });
        insertElement(element, this.loggerComponent.element());
        return element;
    }
    /**
     * close this view
     */
    close() {
        //console.log("Logger view close....")
    }
    destroy() {
        //console.log("Logger view destroy....")
        //this.logModel.destroy();
    }
}
//# sourceMappingURL=LoggerView.js.map