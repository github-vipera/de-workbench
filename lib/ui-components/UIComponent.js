'use babel';
import { EventEmitter } from 'events';
const uuidv4 = require('uuid/v4');
export class UIBaseComponent {
    constructor() {
        this.uiComponentId = uuidv4();
    }
    element() {
        return this.mainElement;
    }
    uiComponentID() {
        return this.uiComponentId;
    }
    destroy() {
        while (this.mainElement.hasChildNodes()) {
            this.mainElement.removeChild(this.mainElement.lastChild);
        }
        this.mainElement.remove();
        this.mainElement = undefined;
    }
}
export class UIExtComponent extends UIBaseComponent {
    constructor() {
        super();
        this._events = new EventEmitter();
    }
    fireEvent(event, ...params) {
        this._events.emit(event, params);
    }
    addEventListener(event, listener) {
        this._events.addListener(event, listener);
    }
    removeEventListener(event, listener) {
        this._events.removeListener(event, listener);
    }
    destroy() {
        this._events.removeAllListeners();
        this._events = null;
        super.destroy();
    }
}
//# sourceMappingURL=UIComponent.js.map