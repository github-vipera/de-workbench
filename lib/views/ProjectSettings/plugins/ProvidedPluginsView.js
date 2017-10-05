'use babel';
import { createElement, insertElement } from '../../../element/index';
const _ = require("lodash");
const $ = require('JQuery');
import { ProjectManager } from '../../../DEWorkbench/ProjectManager';
import { Logger } from '../../../logger/Logger';
import { UIPluginsList, UIPluginMetaButtons } from '../../../ui-components/UIPluginsList';
import { UIBaseComponent } from '../../../ui-components/UIComponent';
import { UILineLoader } from '../../../ui-components/UILineLoader';
import { UINotifications } from '../../../ui-components/UINotifications';
import { EventBus } from '../../../DEWorkbench/EventBus';
export class ProvidedPluginsView extends UIBaseComponent {
    constructor() {
        super();
        this.currentProjectRoot = ProjectManager.getInstance().getCurrentProjectPath();
        this.initUI();
    }
    initUI() {
        EventBus.getInstance().subscribe(EventBus.EVT_PLUGIN_ADDED, (eventData) => {
            if (eventData[0] === this.currentProjectRoot) {
            }
        });
        EventBus.getInstance().subscribe(EventBus.EVT_PLUGIN_REMOVED, (eventData) => {
            if (eventData[0] === this.currentProjectRoot) {
            }
        });
        this.lineLoader = new UILineLoader();
        this.pluginList = new UIPluginsList().addEventListener('didActionRequired', (plugininfo, actionType) => {
            if (actionType === UIPluginMetaButtons.BTN_TYPE_INSTALL) {
                this.doInstallPlugin(plugininfo);
            }
            else if (actionType === UIPluginMetaButtons.BTN_TYPE_UNINSTALL) {
                this.doUninstallPlugin(plugininfo);
            }
            else {
                Logger.getInstance().warn("Action unknwon " + actionType);
            }
        });
        this.extendedUIContainer = createElement('div', {
            className: 'de-workbench-provided-plugins-extui-container'
        });
        this.mainElement = createElement('div', {
            elements: [this.extendedUIContainer, this.pluginList.element(), this.lineLoader.element()],
            className: 'de-workbench-community-plugins-list'
        });
        this.showProgress(false);
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
    markInstalledPlugins(pluginList, installedPlugins) {
        for (var i = 0; i < installedPlugins.length; i++) {
            let index = _.findIndex(pluginList, { 'name': installedPlugins[i].name });
            if (index > -1) {
                pluginList[index].installed = true;
            }
        }
        return pluginList;
    }
    showProgress(show) {
        this.lineLoader.setOnLoading(show);
    }
    destroy() {
        this.pluginList.destroy();
        super.destroy();
    }
    setPluginsProvider(provider) {
        this.pluginsProvider = provider;
        this.pluginsProvider.addEventHandler((event) => {
            if (event && event.type && event.type === 'listChanged') {
                this.reloadPluginList();
            }
        });
        if (this.pluginsProvider.getExtendedUI) {
            let extendedUIElement = this.pluginsProvider.getExtendedUI();
            if (extendedUIElement) {
                insertElement(this.extendedUIContainer, extendedUIElement);
            }
        }
        return this;
    }
    reloadPluginList() {
        try {
            this.pluginsProvider.getCordovaPlugins().then((providedPluginsList) => {
                this.pluginList.setPlugins(providedPluginsList);
            });
            return this;
        }
        catch (ex) {
            Logger.getInstance().error("Error loading plugins list from provider " + this.pluginsProvider + ": " + ex, ex);
            console.error("Error loading plugins list from provider " + this.pluginsProvider + ": " + ex, ex);
        }
    }
}
//# sourceMappingURL=ProvidedPluginsView.js.map