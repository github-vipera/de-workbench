'use babel';
import { createText, createElement } from '../element/index';
import { UIBaseComponent } from './UIComponent';
import { UIListView } from './UIListView';
import { EventEmitter } from 'events';
const moment = require('moment');
const _ = require("lodash");
export class UIPluginsList extends UIListView {
    constructor() {
        super(null);
        this.events = new EventEmitter();
        this.displayConfiguration = {
            ratingVisible: true,
            lastUpdateVisible: true,
            platformsVisible: true,
            authorVisible: true
        };
        this.initModel();
    }
    initModel() {
        this.pluginListModel = new PluginsListModel(this.displayConfiguration).addEventListener('didActionRequired', (pluginInfo, actionType) => {
            this.events.emit('didActionRequired', pluginInfo, actionType);
        });
        this.setModel(this.pluginListModel);
    }
    clearList() {
        this.pluginListModel.clear();
    }
    addPlugin(pluginInfo) {
        this.pluginListModel.addPlugin(pluginInfo);
    }
    addPlugins(plugins) {
        this.pluginListModel.addPlugins(plugins);
    }
    setPlugins(plugins) {
        this.clearList();
        this.pluginListModel.addPlugins(plugins);
    }
    setPluginInstallPending(pluginInfo, installing) {
        this.pluginListModel.setPluginInstallPending(pluginInfo, installing);
    }
    setPluginUInstallPending(pluginInfo, unistalling) {
        this.pluginListModel.setPluginUInstallPending(pluginInfo, unistalling);
    }
    setRatingVisible(visible) {
        this.displayConfiguration.ratingVisible = visible;
        this.updateUI();
        return this;
    }
    setLastUpdateVisible(visible) {
        this.displayConfiguration.lastUpdateVisible = visible;
        this.updateUI();
        return this;
    }
    setPlatformsVisible(visible) {
        this.displayConfiguration.platformsVisible = visible;
        this.updateUI();
        return this;
    }
    updateUI() {
        this.pluginListModel.updateUI(this.displayConfiguration);
    }
    addEventListener(event, listener) {
        this.events.addListener(event, listener);
        return this;
    }
    removeEventListener(event, listener) {
        this.events.removeListener(event, listener);
        return this;
    }
    destroy() {
        this.events.removeAllListeners();
        super.destroy();
        this.events = null;
    }
}
class PluginsListModel {
    constructor(displayConfiguration) {
        this.pluginsMap = {};
        this.events = new EventEmitter();
        this.pluginList = new Array();
        this.displayConfiguration = displayConfiguration;
    }
    addPlugins(plugins) {
        let i = 0;
        for (i = 0; i < plugins.length; i++) {
            this.addPlugin(plugins[i]);
        }
        this.fireModelChanged();
    }
    addPlugin(pluginInfo) {
        let pluginItem = new UIPluginItem(pluginInfo, this.displayConfiguration);
        pluginItem.setEventListener((pluginInfo, actionType) => {
            this.fireActionEvent(pluginInfo, actionType);
        });
        this.pluginList.push(pluginItem);
        this.pluginsMap[pluginInfo.id] = pluginItem;
        this.fireModelChanged();
    }
    hasHeader() {
        return false;
    }
    getRowCount() {
        return this.pluginList.length;
    }
    getColCount() {
        return 1;
    }
    getElementAt(row, col) {
        return this.pluginList[row].element();
    }
    getValueAt(row, col) {
        return row + "_" + col;
    }
    getClassNameAt(row, col) {
        return '';
    }
    getColumnName(col) {
        return '';
    }
    getClassName() {
        return 'de-workbench-plugins-list';
    }
    clear() {
        this.pluginList = new Array();
        this.pluginsMap = {};
        this.fireModelChanged();
    }
    setPluginInstallPending(pluginInfo, installing) {
        let pluginItem = this.pluginsMap[pluginInfo.id];
        if (pluginItem) {
            pluginItem.setPluginInstallPending(installing);
        }
    }
    setPluginUInstallPending(pluginInfo, unistalling) {
        let pluginItem = this.pluginsMap[pluginInfo.id];
        if (pluginItem) {
            pluginItem.setPluginUInstallPending(unistalling);
        }
    }
    updateUI(displayConfiguration) {
        this.displayConfiguration = displayConfiguration;
        for (var i = 0; i < this.pluginList.length; i++) {
            this.pluginList[i].updateUI(displayConfiguration);
        }
    }
    fireActionEvent(pluginInfo, actionType) {
        this.events.emit("didActionRequired", pluginInfo, actionType);
    }
    fireModelChanged() {
        this.events.emit("didModelChanged", this);
    }
    addEventListener(event, listener) {
        this.events.addListener(event, listener);
        return this;
    }
    removeEventListener(event, listener) {
        this.events.removeListener(event, listener);
        return this;
    }
    destroy() {
        this.events.removeAllListeners();
        for (var i = 0; i < this.pluginList.length; i++) {
            this.pluginList[i].destroy();
        }
        this.pluginsMap = null;
        this.pluginList = null;
        this.events = null;
    }
}
export class UIPluginItem extends UIBaseComponent {
    constructor(pluginInfo, displayConfiguration) {
        super();
        this.pluginInfo = pluginInfo;
        this.displayConfiguration = displayConfiguration;
        this.buildUI();
    }
    buildUI() {
        this.bodySection = new UIPluginBodySection(this.pluginInfo, this.displayConfiguration);
        this.metSection = new UIPluginMetaSection(this.pluginInfo, this.displayConfiguration).setEventListener((plugin, actionType) => {
            if (this.callbackFunc) {
                this.callbackFunc(plugin, actionType);
            }
        });
        this.statsSection = new UIPluginStatsSection(this.pluginInfo, this.displayConfiguration);
        this.mainElement = createElement('div', {
            elements: [
                this.statsSection.element(), this.bodySection.element(), this.metSection.element()
            ],
            className: 'de-workbench-plugins-list-item'
        });
    }
    updateUI(displayConfiguration) {
        this.displayConfiguration = displayConfiguration;
        this.metSection.updateUI(displayConfiguration);
        this.bodySection.updateUI(displayConfiguration);
        this.statsSection.updateUI(displayConfiguration);
    }
    setEventListener(callbackFunc) {
        this.callbackFunc = callbackFunc;
        return this;
    }
    setPluginInstallPending(installing) {
        this.bodySection.setPluginInstallPending(installing);
        this.metSection.setPluginInstallPending(installing);
        this.statsSection.setPluginInstallPending(installing);
    }
    setPluginUInstallPending(unistalling) {
        this.bodySection.setPluginUInstallPending(unistalling);
        this.metSection.setPluginUInstallPending(unistalling);
        this.statsSection.setPluginUInstallPending(unistalling);
    }
    destroy() {
        super.destroy();
    }
}
export class UIPluginSection extends UIBaseComponent {
    constructor(pluginInfo, displayConfiguration) {
        super();
        this.displayConfiguration = displayConfiguration;
        this.pluginInfo = pluginInfo;
        this.buildUI();
        this.updateUI(this.displayConfiguration);
    }
    buildUI() {
    }
    updateUI(displayConfiguration) {
        this.displayConfiguration = displayConfiguration;
    }
    setPluginInstallPending(installing) {
    }
    setPluginUInstallPending(unistalling) {
    }
    changeElementVisibility(element, visible) {
        if (!visible) {
            element.style.visibility = "hidden";
        }
        else {
            element.style.visibility = "visible";
        }
    }
}
export class UIPluginStatsSection extends UIPluginSection {
    constructor(pluginInfo, displayConfiguration) {
        super(pluginInfo, displayConfiguration);
    }
    buildUI() {
        this.mainElement = createElement('div', {
            elements: [
                createElement('span', {
                    elements: [
                        createText('TODO!!')
                    ]
                })
            ],
            className: 'stats pull-right'
        });
        this.mainElement.style.display = 'none';
    }
    updateUI(displayConfiguration) {
        super.updateUI(displayConfiguration);
    }
}
export class UIPluginBodySection extends UIPluginSection {
    constructor(pluginInfo, displayConfiguration) {
        super(pluginInfo, displayConfiguration);
    }
    buildUI() {
        super.buildUI();
        let pluginNameEl = createElement('a', {
            elements: [
                createText(this.pluginInfo.name)
            ]
        });
        pluginNameEl.className = "de-workbench-plugins-list-item-plugname";
        pluginNameEl.setAttribute('homepage', this.pluginInfo.homepage);
        pluginNameEl.setAttribute('href', this.pluginInfo.homepage);
        let pluginVersionEl = createElement('span', {
            elements: [
                createText("v" + this.pluginInfo.version)
            ]
        });
        pluginVersionEl.className = "de-workbench-plugins-list-item-plugversion";
        let lastUpdateTimeStr = "Not Available";
        if (this.pluginInfo.lastUpdateTime) {
            try {
                var date = new Date(this.pluginInfo.lastUpdateTime);
                lastUpdateTimeStr = moment(date).fromNow();
            }
            catch (ex) { }
        }
        this.pluginUpdateDateEl = createElement('span', {
            elements: [
                createText("Last update: " + lastUpdateTimeStr)
            ]
        });
        this.pluginUpdateDateEl.className = "de-workbench-plugins-list-item-lastupdate";
        let nameEl = createElement('h4', {
            elements: [
                pluginNameEl,
                pluginVersionEl,
                this.pluginUpdateDateEl
            ]
        });
        let descEl = createElement('span', {
            elements: [
                createText(this.pluginInfo.description)
            ]
        });
        descEl.className = "de-workbench-plugins-list-item-plugdesc";
        this.mainElement = createElement('div', {
            elements: [
                nameEl, descEl
            ]
        });
    }
    updateUI(displayConfiguration) {
        super.updateUI(displayConfiguration);
        this.changeElementVisibility(this.pluginUpdateDateEl, displayConfiguration.lastUpdateVisible);
    }
}
export class UIPluginMetaSection extends UIPluginSection {
    constructor(pluginInfo, displayConfiguration) {
        super(pluginInfo, displayConfiguration);
    }
    buildUI() {
        super.buildUI();
        let userOwner = this.pluginInfo.author;
        let userOwnerEl = createElement('a', {
            elements: [
                createText("by " + userOwner)
            ]
        });
        userOwnerEl.setAttribute("href", this.pluginInfo.homepage);
        userOwnerEl.className = "de-workbench-plugins-list-item-owner";
        this.ratingEl = createElement('span', {
            elements: [
                createText("" + this.pluginInfo.rating)
            ],
            className: 'badge badge-info de-workbench-plugins-list-item-rating'
        });
        this.platformsEl = this.renderPlatforms(this.pluginInfo.platforms);
        let metaUser = createElement('div', {
            elements: [this.ratingEl, userOwnerEl, this.platformsEl],
            className: 'de-workbench-plugins-list-meta-user'
        });
        this.metaButtons = new UIPluginMetaButtons(this.pluginInfo, this.displayConfiguration);
        if (this.pluginInfo.installed) {
            this.metaButtons.showButtons(UIPluginMetaButtons.BTN_TYPE_UNINSTALL)
                .setButtonEnabled(UIPluginMetaButtons.BTN_TYPE_UNINSTALL, true);
        }
        else {
            this.metaButtons.showButtons(UIPluginMetaButtons.BTN_TYPE_INSTALL)
                .setButtonEnabled(UIPluginMetaButtons.BTN_TYPE_INSTALL, true);
        }
        this.metaButtons.setEventListener((buttonClicked) => {
            this.callbackFunc(this.pluginInfo, buttonClicked);
        });
        let metaControls = createElement('div', {
            elements: [
                createElement('div', {
                    elements: [
                        this.metaButtons.element()
                    ],
                    className: 'btn-toolbar'
                })
            ]
        });
        this.mainElement = createElement('div', {
            elements: [
                metaUser, metaControls
            ],
            className: 'de-workbench-plugins-list-meta-cont'
        });
    }
    setEventListener(callbackFunc) {
        this.callbackFunc = callbackFunc;
        return this;
    }
    renderPlatforms(platforms) {
        let textValue = "(" + _.map(platforms, 'displayName').join(",") + ")";
        return createElement('span', {
            elements: [
                createText(textValue)
            ],
            className: 'de-workbench-plugins-list-item-platforms'
        });
    }
    setPluginInstallPending(installing) {
        this.metaButtons.setPluginInstallPending(installing);
    }
    setPluginUInstallPending(installing) {
        this.metaButtons.setPluginUInstallPending(installing);
    }
    updateUI(displayConfiguration) {
        super.updateUI(displayConfiguration);
        this.metaButtons.updateUI(displayConfiguration);
        this.changeElementVisibility(this.ratingEl, displayConfiguration.ratingVisible);
        this.changeElementVisibility(this.platformsEl, displayConfiguration.platformsVisible);
    }
}
export class UIPluginMetaButtons extends UIPluginSection {
    constructor(pluginInfo, displayConfiguration) {
        super(pluginInfo, displayConfiguration);
    }
    setEventListener(callbackFunc) {
        this.callbackFunc = callbackFunc;
    }
    buildUI() {
        super.buildUI();
        this.spinner = createElement('span', {
            className: 'loading loading-spinner-small plugin-install-spinner'
        });
        this.spinner.style.visibility = "hidden";
        this.btnInstall = this.buildButton('Install');
        this.btnInstall.className = this.btnInstall.className + " btn-info icon icon-cloud-download install-button";
        this.btnInstall.addEventListener('click', (evt) => {
            this.callbackFunc(UIPluginMetaButtons.BTN_TYPE_INSTALL);
        });
        this.btnUninstall = this.buildButton('Uninstall');
        this.btnUninstall.className = this.btnUninstall.className + " icon icon-trashcan uninstall-button";
        this.btnUninstall.addEventListener('click', (evt) => {
            if (this.callbackFunc) {
                this.callbackFunc(UIPluginMetaButtons.BTN_TYPE_UNINSTALL);
            }
        });
        this.mainElement = createElement('div', {
            elements: [
                this.btnInstall,
                this.btnUninstall,
                this.spinner
            ],
            className: 'btn-group'
        });
    }
    buildButton(caption) {
        let btn = createElement('button');
        btn.className = "btn de-workbench-plugins-list-meta-btn ";
        btn.textContent = caption;
        btn["disabled"] = true;
        return btn;
    }
    showButtons(buttonType) {
        if (buttonType == UIPluginMetaButtons.BTN_TYPE_INSTALL) {
            this.btnInstall.style["display"] = 'initial';
            this.btnUninstall.style["display"] = 'none';
        }
        else if (buttonType == UIPluginMetaButtons.BTN_TYPE_UNINSTALL) {
            this.btnUninstall.style["display"] = 'initial';
            this.btnInstall.style["display"] = 'none';
        }
        else if (buttonType == (UIPluginMetaButtons.BTN_TYPE_UNINSTALL | UIPluginMetaButtons.BTN_TYPE_INSTALL)) {
            this.btnInstall.style["display"] = 'initial';
            this.btnUninstall.style["display"] = 'initial';
        }
        else {
            this.btnInstall.style["display"] = 'none';
            this.btnUninstall.style["display"] = 'none';
        }
        return this;
    }
    setButtonEnabled(buttonType, enabled) {
        if (buttonType == UIPluginMetaButtons.BTN_TYPE_INSTALL) {
            this.btnInstall["disabled"] = !enabled;
        }
        else if (buttonType == UIPluginMetaButtons.BTN_TYPE_UNINSTALL) {
            this.btnUninstall["disabled"] = !enabled;
        }
        else if (buttonType == (UIPluginMetaButtons.BTN_TYPE_UNINSTALL | UIPluginMetaButtons.BTN_TYPE_INSTALL)) {
            this.btnInstall["disabled"] = !enabled;
            this.btnUninstall["disabled"] = !enabled;
        }
        return this;
    }
    setPluginInstallPending(installing) {
        if (installing) {
            this.btnInstall.style.visibility = "hidden";
            this.spinner.style.visibility = "visible";
        }
        else {
            this.spinner.style.visibility = "hidden";
            this.btnInstall.style.visibility = "visible";
        }
    }
    setPluginUInstallPending(unistalling) {
        if (unistalling) {
            this.btnUninstall.style.visibility = "hidden";
            this.spinner.style.visibility = "visible";
        }
        else {
            this.spinner.style.visibility = "hidden";
            this.btnUninstall.style.visibility = "visible";
        }
    }
    updateUI(displayConfiguration) {
        super.updateUI(displayConfiguration);
    }
}
UIPluginMetaButtons.BTN_TYPE_INSTALL = 1;
UIPluginMetaButtons.BTN_TYPE_UNINSTALL = 2;
//# sourceMappingURL=UIPluginsList.js.map