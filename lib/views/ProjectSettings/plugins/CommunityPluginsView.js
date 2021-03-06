'use babel';
import { createText, createElement, createButtonSpacer } from '../../../element/index';
const _ = require("lodash");
const $ = require('JQuery');
import { ProjectManager } from '../../../DEWorkbench/ProjectManager';
import { Logger } from '../../../logger/Logger';
import { UIPluginsList, UIPluginMetaButtons } from '../../../ui-components/UIPluginsList';
import { UIBaseComponent } from '../../../ui-components/UIComponent';
import { CordovaPluginsFinder } from '../../../cordova/CordovaPluginsFinder';
import { UIButtonGroup, UIButtonConfig, UIButtonGroupMode } from '../../../ui-components/UIButtonGroup';
import { UILineLoader } from '../../../ui-components/UILineLoader';
import { UINotifications } from '../../../ui-components/UINotifications';
import { EventBus } from '../../../DEWorkbench/EventBus';
export class CommunityPluginsView extends UIBaseComponent {
    constructor() {
        super();
        this.currentProjectRoot = ProjectManager.getInstance().getCurrentProjectPath();
        this.initUI();
    }
    initUI() {
        EventBus.getInstance().subscribe(EventBus.EVT_PLUGIN_ADDED, (eventData) => {
            if (eventData[0] === this.currentProjectRoot) {
                this.submitSearch();
            }
        });
        EventBus.getInstance().subscribe(EventBus.EVT_PLUGIN_REMOVED, (eventData) => {
            if (eventData[0] === this.currentProjectRoot) {
                this.submitSearch();
            }
        });
        this.lineLoader = new UILineLoader();
        this.searchTextEditor = createElement('input', {
            className: 'input-search native-key-bindings'
        });
        this.searchTextEditor["type"] = "search";
        this.searchTextEditor["placeholder"] = "Search a plugin";
        let blockEditor = createElement('div', {
            elements: [
                this.searchTextEditor
            ],
            className: 'block'
        });
        this.btnGroupPlatformChooser = new UIButtonGroup(UIButtonGroupMode.Toggle)
            .addButton(new UIButtonConfig().setId('ios').setCaption('iOS').setSelected(true))
            .addButton(new UIButtonConfig().setId('android').setCaption('Android').setSelected(true))
            .addButton(new UIButtonConfig().setId('browser').setCaption('Browser').setSelected(true))
            .addChangeListener((buttonConfig) => {
            this.submitSearch();
        });
        this.queryResultsMessage = createElement('span', {
            elements: [
                createText("No plugins found")
            ],
            className: 'de-workbench-community-plugins-query-results'
        });
        this.setQueryResultMessage(null);
        let blockPlatformChooser = createElement('div', {
            elements: [
                this.btnGroupPlatformChooser.element(),
                createButtonSpacer(),
                this.queryResultsMessage
            ],
            className: 'block'
        });
        this.searchForm = createElement('div', {
            elements: [
                blockEditor,
                blockPlatformChooser
            ],
            className: 'de-workbench-community-plugins-search-form'
        });
        this.pluginList = new UIPluginsList().addEventListener('didActionRequired', (pluginInfo, actionType) => {
            if (actionType === UIPluginMetaButtons.BTN_TYPE_INSTALL) {
                this.doInstallPlugin(pluginInfo);
            }
            else if (actionType === UIPluginMetaButtons.BTN_TYPE_UNINSTALL) {
                this.doUninstallPlugin(pluginInfo);
            }
            else {
                Logger.getInstance().warn("Action unknwon " + actionType);
            }
        });
        this.mainElement = createElement('div', {
            elements: [
                this.searchForm,
                this.pluginList.element(),
                this.lineLoader.element()
            ],
            className: 'de-workbench-community-plugins-list'
        });
        this.showProgress(false);
        this.searchTextEditor.addEventListener('keypress', (evt) => {
            if (evt.which == 13) {
                this.submitSearch();
            }
        });
        $('[platform-select]').click(function (evt) {
            $(evt.currentTaget).toggleClass("selected");
        });
    }
    doInstallPlugin(pluginInfo) {
        this.showProgress(true);
        this.pluginList.setPluginInstallPending(pluginInfo, true);
        ProjectManager.getInstance().cordova.addPlugin(this.currentProjectRoot, pluginInfo).then(() => {
            UINotifications.showInfo("Plugin " + pluginInfo.name + " installed successfully.");
            this.showProgress(false);
            this.pluginList.setPluginInstallPending(pluginInfo, false);
        }).catch(() => {
            UINotifications.showError("Error installing plugin " + pluginInfo.name + ". See the log for more details.");
            this.showProgress(false);
            this.pluginList.setPluginInstallPending(pluginInfo, false);
        });
    }
    doUninstallPlugin(pluginInfo) {
        this.showProgress(true);
        this.pluginList.setPluginUInstallPending(pluginInfo, true);
        ProjectManager.getInstance().cordova.removePlugin(this.currentProjectRoot, pluginInfo).then(() => {
            UINotifications.showInfo("Plugin " + pluginInfo.name + " uninstalled successfully.");
            this.showProgress(false);
            this.pluginList.setPluginUInstallPending(pluginInfo, false);
        }).catch(() => {
            UINotifications.showError("Error uninstalling plugin " + pluginInfo.name + ". See the log for more details.");
            this.showProgress(false);
            this.pluginList.setPluginUInstallPending(pluginInfo, false);
        });
    }
    setQueryResultMessage(count) {
        if (!count) {
            this.queryResultsMessage.setAttribute('hidden', '');
        }
        if (count > 0) {
            if (count == 1) {
                this.queryResultsMessage.innerText = count + " plugin found.";
            }
            else {
                this.queryResultsMessage.innerText = count + " plugins found.";
            }
            this.queryResultsMessage.removeAttribute('hidden');
            this.queryResultsMessage.setAttribute('queryres', '1');
        }
        if (count == 0) {
            this.queryResultsMessage.innerText = "No plugins found.";
            this.queryResultsMessage.removeAttribute('hidden');
            this.queryResultsMessage.setAttribute('queryres', '0');
        }
    }
    submitSearch() {
        let cpf = new CordovaPluginsFinder();
        let names = '';
        let platforms = this.btnGroupPlatformChooser.getSelectedButtons();
        let search = this.searchTextEditor["value"];
        if (search.length == 0 || platforms.length == 0) {
            return;
        }
        this.showProgress(true);
        let keywords = _.split(search, ' ');
        cpf.search(keywords, keywords, platforms).then((results) => {
            ProjectManager.getInstance().cordova.getInstalledPlugins(this.currentProjectRoot).then((installedPlugins) => {
                let processedResults = ProjectManager.getInstance().cordova.markInstalledPlugins(results, installedPlugins);
                this.pluginList.setPlugins(processedResults);
                Logger.getInstance().debug("Plugins found:", processedResults);
                Logger.consoleLog("Plugins found:", processedResults);
            });
            this.setQueryResultMessage(results.length);
            this.showProgress(false);
        }, (err) => {
            alert("Error: " + err);
            this.setQueryResultMessage(null);
            this.showProgress(false);
        });
    }
    showProgress(show) {
        this.lineLoader.setOnLoading(show);
    }
    destroy() {
        this.pluginList.destroy();
        this.btnGroupPlatformChooser.destroy();
        super.destroy();
    }
}
//# sourceMappingURL=CommunityPluginsView.js.map