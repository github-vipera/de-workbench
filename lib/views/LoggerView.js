'use babel';
import { createElement, insertElement } from '../element/index';
import { Logger } from '../logger/Logger';
import { UILoggerComponent, FileTailLogModel } from '../ui-components/UILoggerComponent';
import { UIPane } from '../ui-components/UIPane';
export class LoggerView extends UIPane {
    constructor(uri) {
        super(uri, "Log View");
    }
    createUI() {
        this.logModel = new FileTailLogModel(Logger.getLoggerBufferFilePath(), 10);
        this.loggerComponent = new UILoggerComponent(true, this.logModel);
        let element = createElement('div', {
            elements: []
        });
        insertElement(element, this.loggerComponent.element());
        return element;
    }
    close() {
    }
    destroy() {
    }
}
//# sourceMappingURL=LoggerView.js.map