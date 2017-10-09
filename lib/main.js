'use babel';
const { CompositeDisposable } = require('atom');
import { Logger } from './logger/Logger';
import { CordovaPluginsProvidersManager } from './DEWorkbench/services/CordovaPluginsProvidersManager';
import { ServerManager } from '././DEWorkbench/services/ServerManager';
import { ProjectManager } from './DEWorkbench/ProjectManager';
import { EventBus } from './DEWorkbench/EventBus';
import { ConsumedServices } from './DEWorkbench/ConsumedServices';
import { GlobalPreferences } from './DEWorkbench/GlobalPreferences';
import { ViewManager } from './DEWorkbench/ViewManager';
import { ExecutorService } from './DEWorkbench/services/ExecutorService';
export default {
    deWorkbench: null,
    toolbarPanel: null,
    subscriptions: null,
    loggerView: null,
    ink: null,
    cordovaPluginsProvidersManager: null,
    activate(state) {
        Logger.consoleLog("DEWB activated.");
        ServerManager.getInstance();
        this.cordovaPluginsProvidersManager = CordovaPluginsProvidersManager.getInstance();
        setTimeout(this.deferredActivation.bind(this), 1000);
    },
    deferredActivation() {
        Logger.consoleLog("DEWB deferredActivation.");
        require('atom-package-deps').install('de-workbench', false).then(function (res) {
            Logger.consoleLog("Dep packages installed.");
        });
        let DEWorkbenchClass = require('./DEWorkbench/DEWorkbench').DEWorkbench;
        this.deWorkbench = new DEWorkbenchClass({});
        window["deWorkbench"] = this.deWorkbench;
        window["DEWBGlobalPreferences"] = GlobalPreferences.getInstance();
        let value = 'HeaderPanel';
        this.toolbarPanel = atom.workspace[`add${value}`]({
            item: this.deWorkbench.getToolbarElement()
        });
        let commands = atom.commands.add('atom-workspace', {
            'dewb-menu-view-:toolbar-toggle': () => this.toggleToolbar(),
            'dewb-menu-view-:prjinspector-toggle': () => this.showProjectSettings(),
            'dewb-menu-view-:pushtool-show': () => this.showPushTool(),
            'dewb-menu-view-:servers-show': () => this.deWorkbench.viewManager.openView(ViewManager.VIEW_SERVERS),
            'dewb-menu-view-:bookmarks-toggle': () => this.deWorkbench.viewManager.openView(ViewManager.VIEW_BOOKMARKS),
            'dewb-menu-view-:loggerview-toggle': () => this.toggleLogger()
        });
        this.subscriptions = new CompositeDisposable();
        this.subscriptions.add(commands);
    },
    deactivate() {
        Logger.consoleLog('DEWB deactivated.');
        if (this.deWorkbench) {
            this.deWorkbench.destroy();
        }
    },
    showPushTool() {
        let currentprojectPath = ProjectManager.getInstance().getCurrentProjectPath();
        if (currentprojectPath) {
            this.deWorkbench.viewManager.openView(ViewManager.VIEW_PUSHTOOLS(currentprojectPath));
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
        return CordovaPluginsProvidersManager.getInstance();
    },
    provideLogger() {
        Logger.consoleLog("consumeLogger called");
        return Logger.getInstance();
    },
    provideProjectManager() {
        Logger.consoleLog("provideProjectManager called");
        return ProjectManager.getInstance();
    },
    provideEventBus() {
        Logger.consoleLog("provideEventBus called");
        return EventBus.getInstance();
    },
    provideServerManager() {
        Logger.consoleLog("provideServerManager called");
        return ServerManager.getInstance();
    },
    provideExecutorService() {
        Logger.consoleLog("provideExecutorService called");
        return ExecutorService.getInstance();
    },
};
//# sourceMappingURL=main.js.map