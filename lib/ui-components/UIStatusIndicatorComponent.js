'use babel';
import { createText, createElement, insertElement, createIcon } from '../element/index';
import { UIBaseComponent } from './UIComponent';
export var UIIndicatorStatus;
(function (UIIndicatorStatus) {
    UIIndicatorStatus[UIIndicatorStatus["Idle"] = 0] = "Idle";
    UIIndicatorStatus[UIIndicatorStatus["Busy"] = 1] = "Busy";
    UIIndicatorStatus[UIIndicatorStatus["Success"] = 2] = "Success";
    UIIndicatorStatus[UIIndicatorStatus["Error"] = 3] = "Error";
})(UIIndicatorStatus || (UIIndicatorStatus = {}));
export class UIStatusIndicatorComponent extends UIBaseComponent {
    constructor(initialMsg) {
        super();
        this.status = UIIndicatorStatus.Idle;
        this.initUI(initialMsg);
    }
    initUI(initialMsg) {
        this.createLoadingElement();
        this.createTextElement(initialMsg);
        this.createMainElement();
    }
    createLoadingElement() {
        this.loadingElement = createElement('div', {
            className: 'status-loading'
        });
    }
    createTextElement(msg) {
        this.textElement = createElement('span', {
            className: 'status-text'
        });
        this.updateTextElementContent(msg);
    }
    updateTextElementContent(msg, iconName) {
        let elements = [];
        if (iconName) {
            elements[0] = createIcon(iconName);
        }
        elements[elements.length] = createText(msg || "");
        this.textElement.innerHTML = '';
        insertElement(this.textElement, elements);
    }
    createMainElement() {
        this.mainElement = createElement('div', {
            className: 'de-workbench-status-container',
            elements: [
                this.loadingElement,
                this.textElement
            ]
        });
    }
    updateInternalStatus(oldValue, newValue, message, iconName) {
        this.status = newValue;
        this.setOnLoading(newValue == UIIndicatorStatus.Busy);
        if (message) {
            this.updateTextElementContent(message, iconName);
        }
    }
    setOnLoading(value) {
        this.loadingElement.classList[value ? 'add' : 'remove']('active');
    }
    setStatus(status, message, iconName) {
        this.updateInternalStatus(this.status, status, message, iconName);
    }
    setText(message, iconName) {
        this.updateTextElementContent(message, iconName);
    }
}
//# sourceMappingURL=UIStatusIndicatorComponent.js.map