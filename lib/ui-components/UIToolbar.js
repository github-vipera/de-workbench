'use babel';
/*!
 * Dynamic Engine Workbench
 * Copyright(c) 2017 Dynamic Engine Team @ Vipera Plc
 * MIT Licensed
 */
import { createText, createElement, insertElement, createButton, createIcon, createButtonSpacer } from '../element/index';
import { UIBaseComponent } from './UIComponent';
const { CompositeDisposable } = require('atom');
export class UIToolbarButton {
    constructor() {
        this.className = '';
        this.isToggle = false;
        this.checked = false;
        this.withSpace = true;
    }
    setId(id) { this.id = id; return this; }
    setCaption(caption) { this.caption = caption; return this; }
    setTitle(title) { this.title = title; return this; }
    setClassName(className) { this.className = className; return this; }
    setHandler(handler) { this.handler = handler; return this; }
    setIcon(icon) { this.icon = icon; return this; }
    setToggle(toggle) { this.isToggle = toggle; return this; }
    setChecked(checked) { this.checked = checked; return this; }
    setWithSpace(withSpace) { this.withSpace = withSpace; return this; }
}
export class UIToolbar extends UIBaseComponent {
    constructor() {
        super();
        this.subscriptions = new CompositeDisposable();
        this.initUI();
    }
    initUI() {
        this.floatRightButtons = createElement('div', {
            elements: [],
            className: 'de-workbench-uitoolbar-container-floatright'
        });
        this.mainElement = createElement('div', {
            elements: [
                this.floatRightButtons
            ],
            className: 'de-workbench-uitoolbar-container'
        });
    }
    addElementNoSpace(element) {
        insertElement(this.mainElement, element);
        return this;
    }
    addElement(element) {
        let spacer = createButtonSpacer();
        insertElement(this.mainElement, spacer);
        this.addElementNoSpace(element);
        return this;
    }
    addRightElement(element) {
        let spacer = createButtonSpacer();
        insertElement(this.mainElement, spacer);
        insertElement(this.floatRightButtons, element);
        return this;
    }
    addButton(button) {
        let btn = this.createButton(button);
        if (button.withSpace) {
            this.addElement(btn);
        }
        else {
            this.addElementNoSpace(btn);
        }
        return this;
    }
    addRightButton(button) {
        let btn = this.createButton(button);
        this.addRightElement(btn);
        return this;
    }
    createButton(button) {
        if (button.isToggle) {
            return this.createToggleButton(button);
        }
        let elements = new Array();
        if (button.icon) {
            elements.push(createIcon(button.icon));
        }
        if (button.caption) {
            elements.push(createText(button.caption));
        }
        let options = {};
        if (button.className) {
            options["className"] = button.className;
        }
        if (button.title) {
            options["tooltip"] = {
                subscriptions: this.subscriptions,
                title: button.title
            };
        }
        if (button.handler) {
            options["click"] = button.handler;
        }
        return createButton(options, [elements]);
    }
    //<label class='input-label'>   <input class='input-toggle' type='checkbox' checked> Toggle</label>
    createToggleButton(button) {
        let innerElements = new Array();
        let options = {};
        if (button.title) {
            options["tooltip"] = {
                subscriptions: this.subscriptions,
                title: button.title
            };
        }
        if (button.handler) {
            options["click"] = button.handler;
        }
        let inputToggleEl = createElement('input', {
            className: 'input-toggle',
            tooltip: {
                subscriptions: this.subscriptions,
                title: button.title
            }
        });
        inputToggleEl.type = 'checkbox';
        if (button.checked) {
            inputToggleEl.setAttribute('checked', '');
        }
        innerElements.push(inputToggleEl);
        if (button.caption) {
            innerElements.push(createText(button.caption));
        }
        let className = 'input-label';
        if (button.className) {
            className += ' ' + button.className;
        }
        return createElement('label', {
            className: className,
            elements: innerElements || options,
            options
        });
    }
}
//# sourceMappingURL=UIToolbar.js.map