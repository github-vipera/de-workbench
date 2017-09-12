'use babel';
import { createText, createElement, insertElement } from '../element/index';
import { UIBaseComponent } from '../ui-components/UIComponent';
const $ = require('jquery');
export class UICollapsiblePane extends UIBaseComponent {
    constructor() {
        super();
        this.initUI();
    }
    initUI() {
        this.items = [];
        this.listTreeEl = createElement('ul', {
            className: 'list-tree has-collapsable-children'
        });
        let container = createElement('div', {
            elements: [this.listTreeEl],
            className: 'panel'
        });
        let mainContainer = createElement('div', {
            elements: [container],
            className: 'deprecation-cop'
        });
        this.mainElement = mainContainer;
    }
    addItem(item) {
        let newItem = new CollapsiblePaneElement(item);
        this.items.push(newItem);
        insertElement(this.listTreeEl, newItem.element());
        return this;
    }
    destroy() {
        this.listTreeEl.remove();
        super.destroy();
        delete this.items;
    }
}
class CollapsiblePaneElement extends UIBaseComponent {
    constructor(item) {
        super();
        this.item = item;
        this.initUI();
    }
    initUI() {
        this.captionEl = createElement('span', {
            elements: [createText(this.item.caption)],
            className: 'de-wb-collapsible-pane-item-caption-text'
        });
        let subtleText = '';
        if (this.item.subtle) {
            subtleText = this.item.subtle;
        }
        this.subtleEl = createElement('span', {
            elements: [createText(subtleText)],
            className: 'de-wb-collapsible-pane-item-caption-subtletext'
        });
        this.listItemEl = createElement('div', {
            elements: [this.captionEl, this.subtleEl],
            className: 'de-wb-collapsible-pane-item-caption list-item'
        });
        this.ulViewContainerEl = createElement('ul', {
            elements: [
                this.item.view
            ],
        });
        this.liItem = createElement('li', {
            elements: [
                this.listItemEl,
                this.ulViewContainerEl
            ],
            className: 'de-wb-collapsible-pane-item list-nested-item ' + (this.item.collapsed ? 'collapsed' : '')
        });
        this.listItemEl.addEventListener('click', (evt) => {
            this.liItem.classList.toggle('collapsed');
            this.item.collapsed = !this.item.collapsed;
        });
        this.mainElement = this.liItem;
    }
    destroy() {
        super.destroy();
        $(this.listItemEl).off();
        this.liItem.remove();
    }
}
//# sourceMappingURL=UICollapsiblePane.js.map