/*!
 * Dynamic Engine Workbench
 * Copyright(c) 2017 Dynamic Engine Team @ Vipera Plc
 * MIT Licensed
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const { Logger } = require('./logger/Logger');
const { ConsumedServices } = require('./DEWorkbench/ConsumedServices');
const { InkProvider } = require('./DEWorkbench/DEWBExternalServiceProvider');
const { CompositeDisposable } = require('atom');
module.exports = {
    deWorkbench: null,
    toolbarPanel: null,
    subscriptions: null,
    loggerView: null,
    ink: null,
    cordovaPluginsProvidersManager: null,
    activate(state) {
        setTimeout(this.deferredActivation.bind(this), 1);
    },
    deferredActivation() {
        return __awaiter(this, void 0, void 0, function* () {
            Logger.consoleLog("DEWB deferredActivation.");
            setTimeout(() => {
                require('atom-package-deps').install('de-workbench', false).then(function (res) {
                    Logger.consoleLog("Dep packages installed.");
                });
            }, 1000);
            let DEWorkbenchClass = require('./DEWorkbench/DEWorkbench').DEWorkbench;
            this.deWorkbench = new DEWorkbenchClass({});
            let value = 'HeaderPanel';
            this.toolbarPanel = atom.workspace[`add${value}`]({
                item: this.deWorkbench.getToolbarElement()
            });
            let commands = atom.commands.add('atom-workspace', {
                'dewb-menu-view-:toolbar-toggle': () => this.toggleToolbar(),
                'dewb-menu-view-:prjinspector-toggle': () => this.showProjectSettings(),
                'dewb-menu-view-:pushtool-show': () => this.showPushTool(),
                'dewb-menu-view-:servers-show': () => this.deWorkbench.viewManager.openView(this.viewManagerClass().VIEW_SERVERS),
                'dewb-menu-view-:bookmarks-toggle': () => this.deWorkbench.viewManager.openView(this.viewManagerClass().VIEW_BOOKMARKS),
                'dewb-menu-view-:loggerview-toggle': () => this.toggleLogger()
            });
            this.subscriptions = new CompositeDisposable();
            this.subscriptions.add(commands);
            this.serverManagerInstance();
            this.cordovaPluginsProvidersManager = this.cordovaPluginsProvidersManagerInstance();
        });
    },
    deactivate() {
        Logger.consoleLog('DEWB deactivated.');
        if (this.deWorkbench) {
            this.deWorkbench.destroy();
        }
    },
    showPushTool() {
        let currentprojectPath = this.projectManagerInstance().getCurrentProjectPath();
        if (currentprojectPath) {
            this.deWorkbench["viewManager"].openView(this.viewManagerClass.VIEW_PUSHTOOLS(currentprojectPath));
        }
    },
    showProjectSettings() {
        this.deWorkbench.showProjectSettings();
    },
    toggleToolbar() {
        Logger.consoleLog("Toggle toolbar");
        this.deWorkbench.toggleToolbar();
    },
    toggleLogger() {
        Logger.consoleLog("Toggle Logger");
        this.deWorkbench.toggleLogger();
    },
    consumeInk: function (ink) {
        ConsumedServices.ink = ink;
        this.ink = ink;
    },
    provideCordovaPluginsProvider() {
        Logger.consoleLog("consumeDEWBCordovaPluginsProvider called");
        return this.cordovaPluginsProvidersManagerInstance();
    },
    provideLogger() {
        Logger.consoleLog("consumeLogger called");
        return Logger.getInstance();
    },
    provideProjectManager() {
        Logger.consoleLog("provideProjectManager called");
        return this.projectManagerInstance();
    },
    provideEventBus() {
        Logger.consoleLog("provideEventBus called");
        return this.eventBusInstance();
    },
    provideServerManager() {
        Logger.consoleLog("provideServerManager called");
        return this.serverManagerInstance();
    },
    provideExecutorService() {
        Logger.consoleLog("provideExecutorService called");
        return this.executorServiceInstance();
    },
    executorServiceInstance() {
        return require('./DEWorkbench/services/ExecutorService').ExecutorService.getInstance();
    },
    projectManagerInstance() {
        return require('./DEWorkbench/ProjectManager').ProjectManager.getInstance();
    },
    serverManagerInstance() {
        return require('././DEWorkbench/services/ServerManager').ServerManager.getInstance();
    },
    eventBusInstance() {
        return require('./DEWorkbench/EventBus').EventBus.getInstance();
    },
    viewManagerClass() {
        return require('./DEWorkbench/ViewManager').ViewManager;
    },
    cordovaPluginsProvidersManagerInstance() {
        return require('./DEWorkbench/services/CordovaPluginsProvidersManager').CordovaPluginsProvidersManager.getInstance();
    }
};
//# sourceMappingURL=main.js.map