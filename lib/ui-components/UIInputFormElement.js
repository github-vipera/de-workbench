'use babel';
import { createText, createElement } from '../element/index';
import { EventEmitter } from 'events';
import { UIBaseComponent } from '../ui-components/UIComponent';
import { UISelect } from '../ui-components/UISelect';
const $ = require('jquery');
const remote = require('remote');
const dialog = remote.require('electron').dialog;
const path = require("path");
export var FormType;
(function (FormType) {
    FormType[FormType["Standard"] = 1] = "Standard";
    FormType[FormType["FlexForm"] = 2] = "FlexForm";
})(FormType || (FormType = {}));
export class UIInputFormElement extends UIBaseComponent {
    constructor(options) {
        super();
        this.lastValue = '';
        if (options) {
            this.options = options;
        }
        else {
            this.options = this.defaultOptions();
        }
        this.events = new EventEmitter();
        this.buildUI();
    }
    defaultOptions() {
        return {
            password: false,
            autoSelect: true
        };
    }
    buildUI() {
        let caption = '';
        if (this.options && this.options.caption) {
            caption = this.options.caption;
        }
        this.label = createElement('label', {
            elements: [
                createText(caption)
            ]
        });
        this.inputEditor = this.createInputEditor();
        this.inputEditor.addEventListener('keydown', (evt) => {
            var TABKEY = 9;
            if (this.chainToEl && evt.keyCode == TABKEY) {
                this.chainToEl.focus();
            }
        });
        this.mainElement = this.createControlContainer(this.label, this.inputEditor);
        if (this.options && !this.options.autoSelect) {
        }
        else {
            $(this.inputEditor).focus(() => {
                this.selectAll();
            });
        }
        if (this.options && this.options.placeholder) {
            this.setPlaceholder(this.options.placeholder);
        }
    }
    getLabel() {
        return this.label;
    }
    createControlContainer(label, inputEditor) {
        if (this.options && this.options.formType && this.options.formType === FormType.FlexForm) {
            return this.createControlContainerFlex(label, inputEditor);
        }
        else {
            return this.createControlContainerStd(label, inputEditor);
        }
    }
    createControlContainerStd(label, inputEditor) {
        return createElement('div', {
            elements: [
                label,
                inputEditor
            ],
            className: 'block control-group'
        });
    }
    createControlContainerFlex(label, inputEditor) {
        return createElement('li', {
            elements: [
                label,
                inputEditor
            ],
            className: ''
        });
    }
    createInputEditor() {
        let inputEditor = createElement('input', {
            className: 'input-text native-key-bindings mini'
        });
        if (this.options && this.options.password) {
            inputEditor.setAttribute('type', 'password');
        }
        inputEditor.setAttribute('mini', '');
        inputEditor.setAttribute('tabindex', '-1');
        inputEditor.addEventListener('keydown', (evt) => {
            this.fireEvent('keydown');
        });
        inputEditor.addEventListener('keyup', (evt) => {
            if (this.lastValue != this.getValue()) {
                this.fireEvent('change');
                this.lastValue = this.getValue();
            }
        });
        return inputEditor;
    }
    chainTo(nextElement) {
        this.chainToEl = nextElement;
        return this;
    }
    toChain() {
        return this.inputEditor;
    }
    setExtClassName(extClassName) {
        this.extClassName = extClassName;
        this.mainElement.classList.add(extClassName);
        return this;
    }
    setTagName(tagName) {
        this.tagName = tagName;
        return this;
    }
    setCaption(caption) {
        this.label.innerText = caption;
        return this;
    }
    setValue(value) {
        if (!value) {
            this.inputEditor["value"] = "";
        }
        else {
            this.inputEditor["value"] = value;
        }
        return this;
    }
    getValue() {
        return this.inputEditor["value"];
    }
    setWidth(width) {
        this.mainElement.style.width = width;
        return this;
    }
    setPlaceholder(placeholder) {
        this.inputEditor.setAttribute('placeholder', placeholder);
        return this;
    }
    addEventListener(event, listener) {
        this.events.addListener(event, listener);
        return this;
    }
    fireEvent(event) {
        this.events.emit(event, this);
    }
    selectAll() {
        if (this.inputEditor["setSelectionRange"]) {
            this.inputEditor["setSelectionRange"](0, this.getValue().length);
        }
    }
    destroy() {
        this.events.removeAllListeners();
        this.events = null;
        this.label.remove();
        this.inputEditor.remove();
        this.label = null;
        this.inputEditor = null;
        super.destroy();
    }
}
export class UISelectFormElement extends UIInputFormElement {
    constructor() {
        super();
    }
    createInputEditor() {
        this.selectCtrl = new UISelect();
        this.selectCtrl.element().style.width = "100%";
        return this.selectCtrl.element();
    }
    setCaption(caption) {
        super.setCaption(caption);
        return this;
    }
    getSelectCtrl() {
        return this.selectCtrl;
    }
    setItems(items) {
        this.selectCtrl.setItems(items);
    }
    setValue(value) {
        this.selectCtrl.setSelectedItem(value);
        return this;
    }
    getValue() {
        return this.selectCtrl.getSelectedItem();
    }
    chainTo(nextElement) {
        super.chainTo(nextElement);
        return this;
    }
}
export class UIInputWithButtonFormElement extends UIInputFormElement {
    constructor(options) {
        super(options);
    }
    createControlContainerFlex(label, inputEditor) {
        this.buttonEl = this.createButton("Browse...");
        this.buttonEl.classList.add('inline-block');
        this.buttonEl.classList.add('highlight');
        this.buttonEl.style.marginLeft = "4px";
        this.buttonEl.addEventListener('click', (evt) => {
            this.fireEvent('didActionClicked');
        });
        let divElement = createElement('div', {
            elements: [
                inputEditor, this.buttonEl
            ],
            className: ''
        });
        divElement.style.display = "flex";
        return createElement('li', {
            elements: [
                label,
                divElement
            ],
            className: ''
        });
    }
    createControlContainerStd(label, inputEditor) {
        inputEditor.style.display = 'inline-block';
        inputEditor.style.marginRight = "4px";
        this.buttonEl = this.createButton("Browse...");
        this.buttonEl.classList.add('inline-block');
        this.buttonEl.classList.add('highlight');
        this.buttonEl.addEventListener('click', (evt) => {
            this.fireEvent('didActionClicked');
        });
        let divElement = createElement('div', {
            elements: [
                inputEditor, this.buttonEl
            ],
            className: ''
        });
        divElement.style.display = "flex";
        return createElement('div', {
            elements: [
                label,
                divElement
            ],
            className: 'block control-group'
        });
    }
    createButton(caption) {
        let buttonEl = createElement('button', {
            elements: [
                createText(caption)
            ],
            className: 'btn btn-sm'
        });
        return buttonEl;
    }
    setButtonCaption(caption) {
        this.buttonEl.innerText = caption;
        return this;
    }
    setCaption(caption) {
        super.setCaption(caption);
        return this;
    }
    setPlaceholder(placeholder) {
        super.setPlaceholder(placeholder);
        return this;
    }
    addEventListener(event, listener) {
        super.addEventListener(event, listener);
        return this;
    }
    chainTo(nextElement) {
        super.chainTo(nextElement);
        return this;
    }
}
export class UIInputBrowseForFolderFormElement extends UIInputWithButtonFormElement {
    constructor(options) {
        super(options);
        this.prepareForEvents();
    }
    prepareForEvents() {
        this.addEventListener('didActionClicked', (evt) => {
            this.chooseFolder();
        });
    }
    chooseFolder() {
        var path = dialog.showOpenDialog({
            properties: ['openDirectory']
        });
        if (path && path.length > 0) {
            this.setValue(path);
        }
    }
    setCaption(caption) {
        super.setCaption(caption);
        return this;
    }
    setPlaceholder(placeholder) {
        super.setPlaceholder(placeholder);
        return this;
    }
    addEventListener(event, listener) {
        super.addEventListener(event, listener);
        return this;
    }
    chainTo(nextElement) {
        super.chainTo(nextElement);
        return this;
    }
}
export class UIInputBrowseForFileFormElement extends UIInputBrowseForFolderFormElement {
    constructor(options) {
        super(options);
    }
    chooseFolder() {
        var path = dialog.showOpenDialog({
            properties: ['openFile']
        });
        if (path && path.length > 0) {
            this.setValue(path);
        }
    }
}
//# sourceMappingURL=UIInputFormElement.js.map