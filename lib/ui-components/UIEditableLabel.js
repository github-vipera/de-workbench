'use babel';
import { createText, createElement } from '../element/index';
import { UIExtComponent } from '../ui-components/UIComponent';
const $ = require('jquery');
export class UIEditableLabel extends UIExtComponent {
    constructor(options) {
        super();
        this._editable = true;
        if (options) {
            this._options = options;
        }
        if (this._options && (typeof this._options.editable !== 'undefined')) {
            this._editable = this._options.editable;
        }
        this.initUI();
    }
    initUI() {
        this._editorEl = this.createEditor();
        let caption = '';
        if (this._options && this._options.caption) {
            caption = this._options.caption;
        }
        let className = 'de-workbench-ui-editable-label';
        // CSS Class
        if (this._options && this._options.className) {
            className = className + ' ' + this._options.className;
        }
        this._labelEl = createElement('a', {
            elements: [createText(caption)],
            className: className
        });
        // Events
        this._labelEl.addEventListener('dblclick', (evt) => {
            this.onLabelDoubleClick(evt);
        });
        this._labelContainer = createElement('div', {
            elements: [this._labelEl, this._editorEl]
        });
        this.mainElement = this._labelContainer;
    }
    setCaption(caption) {
        this._labelEl.innerText = caption;
        return this;
    }
    onLabelDoubleClick(evt) {
        if (this._editable) {
            this.startEditing(this._labelEl);
        }
    }
    startEdit() {
        if (this._editable) {
            this.startEditing(this._labelEl);
        }
    }
    createEditor() {
        //let editorEl = createTextEditor({});
        let editorEl = createElement('input', {});
        editorEl.style.background = "transparent";
        editorEl.style.position = "absolute";
        editorEl.style.visibility = "hidden";
        editorEl.classList.add("de-workbench-editable-label-editor");
        editorEl.classList.add("native-key-bindings");
        editorEl.addEventListener('keydown', (evt) => {
            if (evt.keyCode === 13) {
                this.commitEditing();
            }
            if (evt.keyCode === 27) {
                this.cancelEditing();
            }
        });
        return editorEl;
    }
    commitEditing() {
        console.log('commit!');
        let value = this._editorEl["value"];
        this.setCaption(value);
        this._labelEl.style.visibility = "visible";
        this._editorEl.style.visibility = "hidden";
        $(this._editorEl).off('focusout');
        $(this._editorEl).off('keydown');
        this._isEditing = false;
        this.fireEvent('didValueChange', this);
        return true;
    }
    cancelEditing() {
        console.log('cancel!');
        this._labelEl.style.visibility = "visible";
        this._editorEl.style.visibility = "hidden";
        $(this._editorEl).off('focusout');
        $(this._editorEl).off('keydown');
        this._isEditing = false;
    }
    startEditing(cell) {
        this.prepareEditor(cell);
        this._editorEl.style.visibility = "visible";
        this._labelEl.style.visibility = "hidden";
        this._editorEl.focus();
        this._isEditing = true;
        $(this._editorEl).focusout(() => {
            this.commitEditing();
        });
    }
    prepareEditor(cell) {
        this.moveEditor(cell);
        let fontSizeCSS = window.getComputedStyle(this._labelEl).getPropertyValue('font-size');
        this._editorEl.style.setProperty("font-size", fontSizeCSS, "important");
        let fontCSS = window.getComputedStyle(this._labelEl).getPropertyValue('font');
        this._editorEl.style.setProperty("font", fontCSS, "important");
        this._editorEl["value"] = cell.innerText;
        this._editorEl["setSelectionRange"](0, cell.innerText.length);
        $(this._editorEl).keydown(function (e) {
            this.style.width = 0;
            var newWidth = this.scrollWidth + 10;
            if (this.scrollWidth >= this.clientWidth)
                newWidth += 10;
            this.style.width = newWidth + 'px';
        });
        return this._editorEl;
    }
    isEditing() {
        return this._isEditing;
    }
    moveEditor(cell) {
        let width = cell.offsetWidth;
        let height = cell.offsetHeight;
        this._editorEl.style.width = width + "px";
        this._editorEl.style.height = height + "px";
        let offset = $(cell).offset();
        offset.top += 0;
        offset.left += 0;
        $(this._editorEl).offset(offset);
    }
    getCaption() {
        return this._labelEl.innerText;
    }
}
//# sourceMappingURL=UIEditableLabel.js.map