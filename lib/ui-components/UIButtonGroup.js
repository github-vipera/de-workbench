'use babel';
/*!
 * Dynamic Engine Workbench
 * Copyright(c) 2017 Dynamic Engine Team @ Vipera Plc
 * MIT Licensed
 */
import { createText, createElement, insertElement } from '../element/index';
import { UIBaseComponent } from './UIComponent';
export var UIButtonGroupMode;
(function (UIButtonGroupMode) {
    UIButtonGroupMode[UIButtonGroupMode["Standard"] = 0] = "Standard";
    UIButtonGroupMode[UIButtonGroupMode["Toggle"] = 1] = "Toggle";
    UIButtonGroupMode[UIButtonGroupMode["Radio"] = 2] = "Radio";
})(UIButtonGroupMode || (UIButtonGroupMode = {}));
export class UIButtonConfig {
    constructor() {
        this.selected = false;
        this.buttonType = '';
        this.className = '';
    }
    setId(id) {
        this.id = id;
        return this;
    }
    setCaption(caption) {
        this.caption = caption;
        return this;
    }
    setSelected(selected) {
        this.selected = selected;
        return this;
    }
    setButtonType(buttonType) {
        this.buttonType = buttonType;
        return this;
    }
    setClassName(className) {
        this.className = className;
        return this;
    }
    setClickListener(clickListener) {
        this.clickListener = clickListener;
        return this;
    }
}
export class UIButtonGroup extends UIBaseComponent {
    constructor(toggleMode) {
        super();
        this.toggleMode = toggleMode;
        this.buildUI();
    }
    buildUI() {
        this.buttons = {};
        this.listeners = {};
        this.changeListeners = new Array();
        this.buttonGroup = createElement('div', {
            elements: [],
            className: 'de-workbench-ui-togglebuttons btn-group'
        });
        this.mainElement = this.buttonGroup;
    }
    addButton(buttonConfig) {
        let button = this.createButton(buttonConfig);
        insertElement(this.buttonGroup, button);
        this.buttons[buttonConfig.id] = { element: button, id: buttonConfig.id, caption: buttonConfig.caption };
        return this;
    }
    /**
     * Only for UIButtonGroupMode.Toggle
     */
    toggleButton(id) {
        if (this.toggleMode == UIButtonGroupMode.Toggle) {
            this.buttons[id].element.classList.toggle('selected');
        }
    }
    /**
     * Only for UIButtonGroupMode.Toggle and UIButtonGroupMode.Radio
     */
    selectButton(id, select) {
        if (this.toggleMode == UIButtonGroupMode.Standard) {
            //nop
        }
        else if (this.toggleMode == UIButtonGroupMode.Toggle) {
            if (select) {
                this.buttons[id].element.classList.add('selected');
            }
            else {
                this.buttons[id].element.classList.remove('selected');
            }
        }
        else if (this.toggleMode == UIButtonGroupMode.Radio) {
            let currentSelection = this.getSelectedButtons();
            for (var i = 0; i < currentSelection.length; i++) {
                this.buttons[currentSelection[i]].element.classList.remove('selected');
            }
            this.buttons[id].element.classList.add('selected');
        }
    }
    /**
     * Create a button component
     */
    createButton(buttonConfig) {
        let className = "btn platform-select";
        if (buttonConfig.buttonType) {
            className += " btn-" + buttonConfig.buttonType;
        }
        if (buttonConfig.className) {
            className += " " + buttonConfig.className;
        }
        let btn = createElement('button', {
            elements: [
                createText(buttonConfig.caption)
            ],
            className: className
        });
        btn.setAttribute('btngroup-id', buttonConfig.id);
        if (buttonConfig.selected) {
            btn.classList.add('selected');
        }
        let buttonClickListener = (evt) => {
            if (this.toggleMode == UIButtonGroupMode.Standard) {
                //nop
            }
            else if (this.toggleMode == UIButtonGroupMode.Toggle) {
                let el = evt.currentTarget;
                el.classList.toggle('selected');
            }
            else if (this.toggleMode == UIButtonGroupMode.Radio) {
                let buttonEl = evt.currentTarget;
                let buttonId = buttonEl.attributes['btngroup-id'].value;
                this.selectButton(buttonId, true);
            }
            if (buttonConfig.clickListener) {
                buttonConfig.clickListener(buttonConfig.id);
            }
            for (var i = 0; i < this.changeListeners.length; i++) {
                this.changeListeners[i](buttonConfig);
            }
        };
        btn.addEventListener('click', buttonClickListener);
        this.listeners[buttonConfig.id] = {
            button: btn,
            listener: buttonClickListener,
        };
        return btn;
    }
    addChangeListener(listener) {
        this.changeListeners.push(listener);
        return this;
    }
    getSelectedButtons() {
        let ret = new Array();
        for (var key in this.buttons) {
            if (this.buttons.hasOwnProperty(key)) {
                let button = this.buttons[key];
                if (button.element.classList.contains("selected")) {
                    ret.push(button.id);
                }
            }
        }
        return ret;
    }
    destroy() {
        for (var key in this.listeners) {
            if (this.listeners.hasOwnProperty(key)) {
                var btnInfo = this.listeners[key];
                btnInfo.button.removeEventListener('click', btnInfo.listener);
                btnInfo.button.remove();
            }
        }
        this.listeners = {};
        this.buttons = {};
        super.destroy();
    }
}
//# sourceMappingURL=UIButtonGroup.js.map