'use babel';
/*!
* Dynamic Engine Workbench
* Copyright(c) 2017 Dynamic Engine Team @ Vipera Plc
* MIT Licensed
*/
import { createText, createElement } from '../element/index';
import { EventEmitter } from 'events';
const { CompositeDisposable } = require('atom');
export class UIModalPrompt {
    constructor() {
        this.events = new EventEmitter();
    }
    createEditor(value, placeholder) {
        let inputEl = createElement('input', {
            className: 'input-text'
        });
        inputEl.setAttribute('placeholder', placeholder);
        inputEl.value = value;
        inputEl.setSelectionRange(0, value.length);
        return inputEl;
    }
    addEventListener(event, listener) {
        this.events.addListener(event, listener);
    }
    removeEventListener(event, listener) {
        this.events.removeListener(event, listener);
    }
    destroy() {
        this.events.removeAllListeners();
        this.panel = null;
    }
    show(value, placeholder, onConfirmCallback, onCancelCallback) {
        this.subscriptions = new CompositeDisposable();
        this.subscriptions.add(atom.commands.add('atom-workspace', {
            'core:cancel': () => this.doCancel()
        }));
        this.onConfirmCallback = onConfirmCallback;
        this.onCancelCallback = onCancelCallback;
        this.placeholder = placeholder;
        this.value = value;
        this.inputEl = this.createEditor(value, placeholder);
        this.inputEl.addEventListener('keydown', (evt) => {
            evt.stopPropagation();
            if (evt.keyCode === 13) {
                this.doConfirm();
            }
            else if (evt.keyCode === 27) {
                this.doCancel();
            }
        });
        let spacer = createElement('div', {});
        spacer.style.height = "10px";
        this.container = createElement('div', {
            elements: [this.inputEl, spacer, createText('Press Esc to cancel')],
        });
        this.container.style["padding-left"] = "10px";
        this.container.style["padding-right"] = "10px";
        let modalConfig = {
            item: this.container
        };
        modalConfig['className'] = 'de-workbench-modal';
        this.panel = atom.workspace.addModalPanel(modalConfig);
        this.inputEl.focus();
    }
    doConfirm() {
        let txtValue = this.inputEl["value"]; //["getModel"]().getText();
        this.closePanel();
        this.onConfirmCallback(txtValue);
    }
    doCancel() {
        this.closePanel();
        this.onCancelCallback();
    }
    closePanel() {
        this.panel.hide();
        this.panel.destroy();
        this.panel = null;
        this.container.remove();
        this.container = null;
        this.subscriptions.dispose();
    }
}
//# sourceMappingURL=UIModalPrompt.js.map