'use babel';
/*!
 * Dynamic Engine Workbench
 * Copyright(c) 2017 Dynamic Engine Team @ Vipera Plc
 * MIT Licensed
 */
import { createElement } from '../element/index';
import { EventEmitter } from 'events';
const md5 = require('md5');
export class UIPane {
    static get PANE_URI_PREFIX() { return "deworkbench://"; }
    constructor(options) {
        this._options = options;
        this._events = new EventEmitter();
        this._title = this._options.getTitle();
        console.log("UIPane creating for ", this._options.id);
        // Initialize the UI
        this.initUI();
    }
    initUI() {
        // Create the main UI
        this.mainElement = this.createUI();
        let el = createElement('div', {
            elements: [
                this.mainElement
            ],
            className: 'de-workbench-pane-view'
        });
        this.domEl = el;
    }
    createUI() {
        // you need to subclass and override this method
        throw ("Invalid implementation");
    }
    didOpen() {
        //nop, overridable
    }
    destroy() {
        this.mainElement.remove();
        this.domEl.remove();
    }
    setTitle(title) {
        this._title = title;
        this.fireEvent('did-change-title', title);
    }
    get paneId() {
        return this._options.id;
    }
    get options() {
        return this._options;
    }
    static hashString(value) {
        return md5(value);
    }
    getTitle() {
        return this._title;
    }
    get element() {
        return this.domEl;
    }
    getURI() {
        return this._options.getURI();
    }
    fireEvent(event, ...params) {
        this._events.emit(event, params);
    }
}
//# sourceMappingURL=UIPane.js.map