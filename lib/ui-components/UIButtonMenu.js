'use babel';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/*!
 * Dynamic Engine Workbench
 * Copyright(c) 2017 Dynamic Engine Team @ Vipera Plc
 * MIT Licensed
 */
import { createText, createElement } from '../element/index';
import { UIBaseComponent } from './UIComponent';
const SelectListView = require('atom-select-list');
export class UIButtonMenu extends UIBaseComponent {
    constructor() {
        super();
        this.initUI();
    }
    initUI() {
        this.mainElement = createElement('button', {
            elements: [
                createText("Button Menu")
            ],
            className: 'btn inline-block-tigh btn-primary de-workbench-button-menu'
        });
        this.mainElement.addEventListener('click', (evt) => {
            this.showMenu();
        });
    }
    setCaption(caption) {
        this.mainElement.innerText = caption;
        return this;
    }
    setMenuItems(items) {
        this.items = items;
        return this;
    }
    showMenu() {
        this.listView = new SelectListView({
            items: this.items,
            infoMessage: this.infoMessage,
            emptyMessage: this.emptyMessage,
            elementForItem: this.createMenuElement,
            filterKeyForItem: (item) => item.displayName,
            didConfirmSelection: (item) => {
                console.log("Selected menu item ", item);
                this.dismissMenu();
                setTimeout(() => {
                    this.onItemSelected(item);
                }, 50);
            },
            didCancelSelection: () => {
                this.dismissMenu();
            }
        });
        this.panel = atom.workspace.addModalPanel({
            item: this.listView
        });
        this.listView.focus();
        this.panel.show();
    }
    onItemSelected(item) {
        if (this.onSelectListener) {
            this.onSelectListener(item);
        }
    }
    dismissMenu() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.panel.destroy();
            yield this.listView.destroy();
        });
    }
    createMenuElement(item) {
        var content = null;
        if (item.element) {
            content = item.element;
        }
        else if (item.displayName) {
            content = createText(item.displayName);
        }
        else {
            content = createText(item.value);
        }
        var el = createElement('li', { elements: [content] });
        el.setAttribute('menu-item-value', item.value);
        el.classList.add('de-workbench-menu-item');
        return el;
    }
    setInfoMessage(message) {
        this.infoMessage = message;
        return this;
    }
    setEmptyMessage(message) {
        this.emptyMessage = message;
        return this;
    }
    setOnSelectionListener(listener) {
        this.onSelectListener = listener;
        return this;
    }
}
//# sourceMappingURL=UIButtonMenu.js.map