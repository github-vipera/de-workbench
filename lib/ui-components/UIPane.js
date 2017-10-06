'use babel';
import { createElement, insertElement } from '../element/index';
import { EventEmitter } from 'events';
import { Logger } from '../logger/Logger';
const md5 = require('md5');
const $ = require('jquery');
export class UIPane {
    static get PANE_URI_PREFIX() { return "deworkbench://"; }
    constructor(uri, title) {
        Logger.consoleLog("UIPane for URI:", uri);
        this._uri = uri;
        this._events = new EventEmitter();
        this._el = createElement('div', {
            elements: [],
            className: 'de-workbench-pane-view'
        });
        this.domEl = this._el;
        if (title) {
            this.setTitle(title);
        }
    }
    init(options) {
        this._options = options;
        this.mainElement = this.createUI();
        insertElement(this._el, this.mainElement);
        Logger.consoleLog("UIPane initialized for ", this._options.id, {});
    }
    createUI() {
        throw ("Invalid implementation");
    }
    didOpen() {
    }
    destroy() {
        this.mainElement.remove();
        this.domEl.remove();
    }
    setTitle(title) {
        this._title = title;
        this.updateTitleUI(title);
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
        return this._uri;
    }
    fireEvent(event, ...params) {
        this._events.emit(event, params);
    }
    getAtomPane() {
        return $(this._el).parent().parent();
    }
    updateTitleUI(title) {
        try {
            let tabTitleEl = this.getAtomPane().find('.tab-bar').find('.tab').find('.title');
            tabTitleEl.html(title);
        }
        catch (ex) {
            Logger.consoleLog("updateTitleUI error: ", ex);
        }
    }
}
//# sourceMappingURL=UIPane.js.map