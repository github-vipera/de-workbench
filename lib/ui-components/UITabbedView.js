'use babel';
/*!
 * Dynamic Engine Workbench
 * Copyright(c) 2017 Dynamic Engine Team @ Vipera Plc
 * MIT Licensed
 */
import { createText, createElement, insertElement } from '../element/index';
import { UIBaseComponent } from './UIComponent';
import { EventEmitter } from 'events';
const crypto = require('crypto');
const events = require('events');
const _ = require('lodash');
export class UITabbedViewItem {
    constructor(id, title, view) {
        this.titleClassName = '';
        this.events = new EventEmitter();
        this.id = id;
        this.title = title;
        this.view = view;
        this.elementUID = crypto.createHash('md5').update(title).digest("hex");
    }
    setTitleClass(className) {
        this.titleClassName = className;
        return this;
    }
    setTitle(title) {
        this.title = title;
        this.fireTitleChanged();
        return this;
    }
    getTitle() {
        return this.title;
    }
    fireTitleChanged() {
        this.events.emit('didTitleChanged', this);
    }
    addEventListener(event, listener) {
        this.events.addListener(event, listener);
    }
    removeEventListener(event, listener) {
        this.events.removeListener(event, listener);
    }
    destroy() {
        this.events.removeAllListeners();
        this.view.remove();
        this.view = null;
        this.events = null;
    }
}
export var UITabbedViewTabType;
(function (UITabbedViewTabType) {
    UITabbedViewTabType[UITabbedViewTabType["Vertical"] = 0] = "Vertical";
    UITabbedViewTabType[UITabbedViewTabType["Horizontal"] = 1] = "Horizontal";
})(UITabbedViewTabType || (UITabbedViewTabType = {}));
/**
 * Tabbed View main component
 */
export class UITabbedView extends UIBaseComponent {
    constructor() {
        super();
        this.buildUI();
    }
    buildUI() {
        let tabbedViewClass = "de-workbench-tabbedview";
        // create the tab view items list
        this.views = new Array();
        // the component that manages the tab list
        this.tabList = new UITabbedViewTabListComponent();
        // the component that manages the stacked views
        this.stacked = new UITabbedViewStackedComponent('stack-view-container');
        this.mainElement = createElement('div', {
            elements: [
                this.tabList.element(),
                this.stacked.element()
            ],
            className: tabbedViewClass
        });
        this.mainElement.id = this.uiComponentId;
        //by default
        this.setTabType(UITabbedViewTabType.Vertical);
        // listen fo events
        this.tabList.addEventListener(UITabbedViewTabListComponent.EVT_TABITEM_SELECTED, (tabItem, htmlElement) => {
            this.selectedTab = tabItem;
            this.stacked.selectView(tabItem);
        });
    }
    getSelectedTab() {
        return this.selectedTab;
    }
    setTabType(tabType) {
        let needRedraw = (this.tabType != tabType);
        if (!needRedraw) {
            return this;
        }
        this.tabType = tabType;
        let tabTypeClassToRemove = '';
        let tabTypeClassName = '';
        if (tabType === UITabbedViewTabType.Horizontal) {
            tabTypeClassName = UITabbedView.CLSNAME_TAB_TYPE_HORIZONTAL;
            tabTypeClassToRemove = UITabbedView.CLSNAME_TAB_TYPE_VERTICAL;
        }
        else {
            tabTypeClassName = UITabbedView.CLSNAME_TAB_TYPE_VERTICAL;
            tabTypeClassToRemove = UITabbedView.CLSNAME_TAB_TYPE_HORIZONTAL;
        }
        this.mainElement.classList.remove(tabTypeClassToRemove);
        this.mainElement.classList.add(tabTypeClassName);
        this.tabList.toggleTabTypeClass(tabTypeClassToRemove, tabTypeClassName);
        this.stacked.toggleTabTypeClass(tabTypeClassToRemove, tabTypeClassName);
        return this;
    }
    createTabList() {
        let listEl = createElement('ol', {
            className: 'de-workbench-tabbedview-tablist-ol'
        });
        let tabListEl = createElement('div', {
            elements: [
                listEl
            ],
            className: 'de-workbench-tabbedview-tablist-container'
        });
        return tabListEl;
    }
    createStackContainer() {
        let stackViewContEl = createElement('div', {
            elements: [
                createText('Stacked View Container')
            ],
            className: 'de-workbench-tabbedview-stackview'
        });
        return stackViewContEl;
    }
    addView(tabItem) {
        this.views.push(tabItem);
        this.tabList.addTab(tabItem);
        this.stacked.addView(tabItem);
        // if is the first tab then select it
        if (this.views.length === 1) {
            this.selectedTab = tabItem;
        }
    }
    removeViewByTitle(tabTitle) {
        let tabItem = this.getTabItemByTitle(tabTitle);
        if (tabItem) {
            this.removeView(tabItem);
        }
    }
    removeViewById(tabId) {
        let tabItem = this.getTabItemById(tabId);
        if (tabItem) {
            this.removeView(tabItem);
        }
    }
    getTabItemByTitle(tabTitle) {
        return _.find(this.views, function (tabItem) {
            return tabItem.getTitle() === tabTitle;
        });
    }
    getTabItemById(tabId) {
        return _.find(this.views, function (tabItem) {
            return tabItem.id === tabId;
        });
    }
    removeView(tabItem) {
        this.tabList.removeTab(tabItem);
        this.stacked.removeView(tabItem);
        _.remove(this.views, function (item) {
            return item.id === tabItem.id;
        });
        tabItem.destroy();
    }
    removeAllTabs() {
        let allTabsIds = this.getAllIds();
        for (var i = 0; i < allTabsIds.length; i++) {
            this.removeViewById(allTabsIds[i]);
        }
    }
    getAllIds() {
        let ret = [];
        for (var i = 0; i < this.views.length; i++) {
            ret.push(this.views[i].id);
        }
        return ret;
    }
    setBottomToolbar(toolbarElement) {
        this.tabList.addBottomToolbar(toolbarElement);
        return this;
    }
    destroy() {
        this.tabList.destroy();
        this.stacked.destroy();
        super.destroy();
    }
}
UITabbedView.CLSNAME_TAB_TYPE_VERTICAL = "tab-type-vertical";
UITabbedView.CLSNAME_TAB_TYPE_HORIZONTAL = "tab-type-horizontal";
UITabbedView.CLSNAME_TAB_TYPE_DEFAULT = UITabbedView.CLSNAME_TAB_TYPE_VERTICAL;
/**
 * List inner component
 */
class UITabbedViewTabListComponent extends UIBaseComponent {
    constructor() {
        super();
        this.itemsElementsMap = {};
        this.tabItemsMap = {};
        this.tabCaptionsMap = {};
        this.eventEmitter = new events.EventEmitter();
        this.currentTabTypeClassName = UITabbedView.CLSNAME_TAB_TYPE_DEFAULT;
        this.buildUI();
    }
    buildUI() {
        this.olElement = createElement('ol', {
            className: 'de-workbench-tabbedview-tablist-ol'
        });
        this.mainElement = createElement('div', {
            elements: [
                this.olElement
            ],
            className: 'de-workbench-tabbedview-tablist-container'
        });
    }
    addBottomToolbar(toolbarEl) {
        this.bottomToolbarElement = toolbarEl;
        this.bottomToolbarContainer = createElement('div', {
            elements: [this.bottomToolbarElement],
            className: 'de-workbench-tabbedview-tablist-bottomtoolbar-container'
        });
        insertElement(this.mainElement, this.bottomToolbarContainer);
        return this;
    }
    /**
     * Add a new tab item
     **/
    addTab(tabItem) {
        let elementId = this.getItemIdForMaps(tabItem);
        let aElement = createElement('a', {
            elements: [
                createText(tabItem.getTitle())
            ],
            className: tabItem.titleClassName
        });
        aElement.id = elementId;
        let liElement = createElement('li', {
            elements: [
                aElement
            ],
            className: "de-workbench-tabbedview-tab-item " + this.currentTabTypeClassName
        });
        liElement.id = elementId;
        liElement.addEventListener('click', (evt) => {
            evt.preventDefault();
            this.onTabItemSelected(evt.srcElement);
        });
        this.tabCaptionsMap[elementId] = aElement;
        this.itemsElementsMap[elementId] = liElement;
        this.tabItemsMap[elementId] = tabItem;
        insertElement(this.olElement, liElement);
        if (this.selectedElement == undefined) {
            this.selectedElement = liElement;
            this.selectedElement.classList.toggle('selected');
        }
        tabItem.addEventListener('didTitleChanged', (tabItem) => {
            let el = this.tabCaptionsMap[this.getItemIdForMaps(tabItem)];
            if (el) {
                el.innerText = tabItem.getTitle();
            }
        });
    }
    getItemIdForMaps(tabItem) {
        return "tabitem_" + tabItem.elementUID;
    }
    /**
     * Remmove a tab
     */
    removeTab(tabItem) {
        let elementId = this.getItemIdForMaps(tabItem);
        let aElement = this.tabCaptionsMap[elementId];
        let liElement = this.itemsElementsMap[elementId];
        if (liElement) {
            this.olElement.removeChild(liElement);
        }
        delete this.tabCaptionsMap[elementId];
        delete this.itemsElementsMap[elementId];
        delete this.tabItemsMap[elementId];
    }
    /**
     * Select the given tab
     */
    selectTab(tabItem) {
        // TODO!!
    }
    /**
     * Change selected item and generate the event for listeners
     */
    onTabItemSelected(item) {
        let selectedID = item.id.substring("tabitem_".length);
        if (this.selectedElement && (this.selectedElement.id == item.id)) {
            //already selected
            return;
        }
        else if (this.selectedElement && (this.selectedElement.id != item.id)) {
            //remove selection
            this.selectedElement.classList.toggle('selected');
        }
        this.selectedElement = this.itemsElementsMap[item.id];
        this.selectedElement.classList.toggle('selected');
        // generate event
        //console.log("Clicked element li:",this.selectedElement);
        this.eventEmitter.emit(UITabbedViewTabListComponent.EVT_TABITEM_SELECTED, this.tabItemsMap[item.id], this.itemsElementsMap[item.id]);
    }
    addEventListener(event, listener) {
        this.eventEmitter.on(event, listener);
    }
    toggleTabTypeClass(classToRemove, classToAdd) {
        this.currentTabTypeClassName = classToAdd;
        this.olElement.classList.remove(classToRemove);
        this.olElement.classList.add(classToAdd);
        this.mainElement.classList.remove(classToRemove);
        this.mainElement.classList.add(classToAdd);
        //    this.itemsElementsMap[elementId] = liElement;
        for (var key in this.itemsElementsMap) {
            this.itemsElementsMap[key].classList.remove(classToRemove);
            this.itemsElementsMap[key].classList.add(classToAdd);
        }
    }
    destroy() {
        this.olElement.remove();
        delete this.itemsElementsMap;
        delete this.tabItemsMap;
        delete this.tabCaptionsMap;
        this.eventEmitter.removeAllListeners();
        super.destroy();
        this.eventEmitter = undefined;
    }
}
UITabbedViewTabListComponent.EVT_TABITEM_SELECTED = "UITabbedViewTabListComponent.tabItemSelected";
/**
 * Stacked views inner component
 */
class UITabbedViewStackedComponent extends UIBaseComponent {
    constructor(className) {
        super();
        this.className = "";
        this.className = className;
        this.buildUI();
    }
    buildUI() {
        this.mainElement = createElement('div', {
            className: 'de-workbench-tabbedview-stacked-container ' + this.className
        });
        this.mainElement.style["display"] = "flex";
    }
    element() {
        return this.mainElement;
    }
    addView(tabItem) {
        if (!tabItem.view) {
            return;
        }
        // set the attribute to find it when necessary
        tabItem.view.setAttribute('tabitem-id', tabItem.id);
        tabItem.view.setAttribute('tabitem-uid', tabItem.elementUID);
        insertElement(this.mainElement, tabItem.view);
        if (this.selectedView == undefined) {
            this.selectedView = tabItem.view;
            this.selectedView.style.display = "initial";
        }
        else {
            tabItem.view.style.display = "none";
        }
    }
    removeView(tabItem) {
        if (!tabItem.view) {
            return;
        }
        let viewEl = this.getViewElement(tabItem);
        if (viewEl) {
            this.mainElement.removeChild(viewEl);
        }
    }
    getViewElement(tabItem) {
        let nodeList = document.querySelectorAll('[tabitem-uid="' + tabItem.elementUID + '"]');
        if (nodeList && nodeList.length === 1) {
            return nodeList[0];
        }
        return null;
    }
    selectView(tabItem) {
        if (!tabItem.view) {
            return;
        }
        if (this.selectedView != undefined) {
            this.selectedView.style.display = "none";
        }
        this.selectedView = tabItem.view;
        this.selectedView.style.display = "initial";
    }
    toggleTabTypeClass(classToRemove, classToAdd) {
        this.mainElement.classList.remove(classToRemove);
        this.mainElement.classList.add(classToAdd);
    }
    destroy() {
        super.destroy();
    }
}
//# sourceMappingURL=UITabbedView.js.map