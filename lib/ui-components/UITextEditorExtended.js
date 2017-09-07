'use babel';
/*!
 * Dynamic Engine Workbench
 * Copyright(c) 2017 Dynamic Engine Team @ Vipera Plc
 * MIT Licensed
 */
import { createText, createElement, insertElement } from '../element/index';
import { UIBaseComponent } from './UIComponent';
export class UITextEditorExtended extends UIBaseComponent {
    constructor() {
        super();
        this.initUI();
    }
    initUI() {
        this.mainElement = createElement('div', {
            elements: [],
            className: 'de-workbench-textinput-extended'
        });
        this.inputEl = createElement('atom-text-editor', {});
        this.inputEl.classList.add("editor");
        this.inputEl.classList.add("mini");
        this.inputEl.classList.add("de-workbench-textinput-extended-editor");
        this.inputEl.classList.add('btn-group-xs');
        this.inputEl.setAttribute('data-grammar', 'text plain null-grammar');
        this.inputEl.setAttribute('mini', '');
        this.editor = this.inputEl['getModel']();
        this.buttonText = createText('');
        this.buttonElement = createElement('button', {
            elements: [
                this.buttonText
            ],
            className: 'btn'
        });
        this.buttonElement.classList.add('de-workbench-textinput-extended-btn');
        insertElement(this.inputEl, this.buttonElement);
        insertElement(this.mainElement, this.inputEl);
    }
    setTextPlaceholder(placeholder) {
        this.editor.setPlaceholderText(placeholder);
        return this;
    }
    setButtonClassName(className) {
        this.buttonElement.classList.add(className);
        return this;
    }
    setButtonCaption(caption) {
        this.buttonCaption = caption;
        this.buttonText.textContent = caption;
        return this;
    }
    addButtonHandler(handler) {
        this.buttonHandler = handler;
        this.buttonElement.addEventListener('click', handler);
        return this;
    }
    addEditorHandler(handler) {
        this.editorHandler = handler;
        this.inputEl.addEventListener('keyup', handler);
        return this;
    }
    getValue() {
        return this.editor.getText();
    }
    getEditor() {
        return this.editor;
    }
    destroy() {
        if (this.buttonHandler) {
            this.buttonElement.removeEventListener('click', this.buttonHandler);
        }
        if (this.editorHandler) {
            this.inputEl.removeEventListener('keyup', this.editorHandler);
        }
        super.destroy();
    }
}
//# sourceMappingURL=UITextEditorExtended.js.map