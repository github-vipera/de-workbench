'use babel';
/*!
 * Dynamic Engine Workbench
 * Copyright(c) 2017 Dynamic Engine Team @ Vipera Plc
 * MIT Licensed
 */
import { createText, createElement, insertElement } from '../element/index';
import { UIBaseComponent } from './UIComponent';
import { EventEmitter } from 'events';
const $ = require("jquery");
export class UITreeView extends UIBaseComponent {
    constructor(model) {
        super();
        this.events = new EventEmitter();
        this.initUI();
        if (model) {
            this.setModel(model);
        }
    }
    initUI() {
        this.mainElement = createElement('div', {
            elements: [],
            className: 'de-workbench-treeview' // do not use this class in order to avoid key bindings problems: 'tree-view'
        });
    }
    setModel(model) {
        this.model = model;
        this.onModelChanged();
        this.model.addEventListener('didModelChanged', () => {
            this.onModelChanged();
        });
    }
    onModelChanged() {
        let oldTree = this.treeElement;
        this.treeElement = this.rebuildTree();
        if (oldTree) {
            this.mainElement.replaceChild(this.treeElement, oldTree);
        }
        else {
            insertElement(this.mainElement, this.treeElement);
        }
        this.currentSelection = null;
        this.events.emit("didModelChanged", this);
    }
    rebuildTree() {
        let rootItemEl = this.buildTreeItem(this.model.root);
        let ulMainTree = createElement('ul', {
            elements: [rootItemEl],
            className: 'list-tree has-collapsable-children focusable-panel'
        });
        return ulMainTree;
    }
    buildTreeItem(item) {
        let iconClass = "";
        if (item.icon) {
            iconClass = "icon " + item.icon;
        }
        let innerHtml = undefined;
        if (item.htmlElement) {
            innerHtml = createElement('div', {
                elements: [item.htmlElement]
            });
        }
        else {
            // create item caption
            innerHtml = createElement('span', {
                elements: [createText(item.name)],
                className: iconClass
            });
        }
        let customClassName = "";
        if (item.className) {
            customClassName = item.className;
        }
        if (item.htmlElement) {
            customClassName = customClassName + " custom-renderer";
        }
        let treeItemHeader = createElement('div', {
            elements: [innerHtml],
            className: 'header list-item ' + customClassName
        });
        treeItemHeader.setAttribute("treeitemId", item.id);
        treeItemHeader.setAttribute("id", "de-woekbench-treeview-treeitem-header-" + item.id);
        if (item.selected) {
            treeItemHeader.classList.add("selected");
        }
        treeItemHeader.addEventListener('click', (evt) => {
            evt.stopPropagation();
            this.onItemClicked(evt);
        });
        treeItemHeader.addEventListener('dblclick', (evt) => {
            evt.stopPropagation();
            this.onItemDblClicked(evt);
        });
        // create children
        let childCount = 0;
        let treeItemChildren = createElement('ol', {
            className: 'de-workbench-treeview-chidlren-list entries list-tree'
        });
        if (item.children) {
            childCount = item.children.length;
            for (var i = 0; i < item.children.length; i++) {
                let child = this.buildTreeItem(item.children[i]);
                insertElement(treeItemChildren, child);
            }
        }
        let listClassName = 'list-item';
        if (childCount > 0) {
            listClassName = 'list-nested-item';
        }
        if (!item.expanded) {
            listClassName += ' collapsed';
        }
        let treeItem = createElement('li', {
            className: 'de-woekbench-treeview-treeitem entry ' + listClassName,
            elements: [treeItemHeader, treeItemChildren]
        });
        if (item.selected) {
            treeItem.classList.add("selected");
        }
        treeItem.setAttribute("treeitemId", item.id);
        treeItem.setAttribute("id", this.buildItemElementId(item.id));
        if (item.attributes) {
            let attributes = item.attributes;
            for (var attr = 0; attr < attributes.length; attr++) {
                treeItem.setAttribute(attributes[attr].name, attributes[attr].value);
            }
        }
        return treeItem;
    }
    addEventListener(event, listener) {
        this.events.addListener(event, listener);
    }
    removeEventListener(event, listener) {
        this.events.removeListener(event, listener);
    }
    onItemDblClicked(evt) {
        let itemId = evt.currentTarget.attributes["treeitemId"].value;
        let item = null;
        if (this.model.getItemById) {
            item = this.model.getItemById(itemId);
        }
        this.events.emit("didItemDblClick", itemId, item);
    }
    onItemClicked(evt) {
        // Expand/Collapse if necessary
        let itemId = evt.currentTarget.attributes["treeitemId"].value;
        this.toggleTreeItemExpansion(itemId);
        // Select the item
        if (this.currentSelection) {
            // remove current selection
            this.selectItemById(this.currentSelection, false);
        }
        this.selectItemById(itemId, true);
        this.currentSelection = itemId;
        this.fireSelectionChange(this.currentSelection);
    }
    fireSelectionChange(itemId) {
        let item = null;
        if (this.model.getItemById) {
            item = this.model.getItemById(itemId);
        }
        this.events.emit("didItemSelected", itemId, item);
    }
    getCurrentSelectedItemId() {
        return this.currentSelection;
    }
    selectItemById(id, select) {
        let el = this.mainElement.querySelector('#de-woekbench-treeview-treeitem-header-' + id);
        if (select) {
            el.classList.add("selected");
            el.parentElement.classList.add("selected");
        }
        else {
            el.classList.remove("selected");
            el.parentElement.classList.remove("selected");
        }
    }
    buildItemElementId(id) {
        return "de-woekbench-treeview-treeitem-li-" + id;
    }
    expandItemById(id) {
        let el = this.getTreeItemById(id);
        el.classList.remove("collapsed");
        let treeItem = this.model.getItemById(id);
        treeItem.expanded = true;
        this.events.emit("didItemExpanded", id);
    }
    collapseItemById(id) {
        let el = this.getTreeItemById(id);
        el.classList.add("collapsed");
        let treeItem = this.model.getItemById(id);
        treeItem.expanded = false;
        this.events.emit("didItemCollapsed", id);
    }
    toggleTreeItemExpansion(id) {
        let el = this.getTreeItemById(id);
        el.classList.toggle("collapsed");
        let treeItem = this.model.getItemById(id);
        if (el.classList.contains("collapsed")) {
            this.events.emit("didItemCollapsed", id);
            treeItem.expanded = false;
        }
        else {
            this.events.emit("didItemExpanded", id);
            treeItem.expanded = true;
        }
    }
    getTreeItemById(id) {
        let itemElementId = this.buildItemElementId(id);
        return this.mainElement.querySelector("#" + itemElementId);
    }
    destroy() {
        this.events.removeAllListeners();
        this.model = undefined;
        if (this.treeElement) {
            this.treeElement.remove();
        }
        this.events = null;
        super.destroy();
    }
}
export function findItemInTreeModel(itemId, model) {
    function _findInTreeItem(item) {
        if (item.id == itemId) {
            return item;
        }
        if (!item.children) {
            return null;
        }
        for (let i = 0; i < item.children.length; i++) {
            let found = _findInTreeItem(item.children[i]);
            if (found) {
                return found;
            }
        }
    }
    return _findInTreeItem(model.root);
}
//# sourceMappingURL=UITreeView.js.map