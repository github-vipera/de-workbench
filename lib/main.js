'use babel';
/*!
 * Dynamic Engine Workbench
 * Copyright(c) 2017 Dynamic Engine Team @ Vipera Plc
 * MIT Licensed
 */
const { CompositeDisposable } = require('atom');
//import { DEWorkbench } from './DEWorkbench/DEWorkbench'
import { Logger } from './logger/Logger';
import { CordovaPluginsProvidersManager } from './DEWorkbench/services/CordovaPluginsProvidersManager';
import { ServerManager } from '././DEWorkbench/services/ServerManager';
import { ProjectManager } from './DEWorkbench/ProjectManager';
import { EventBus } from './DEWorkbench/EventBus';
import { ConsumedServices } from './DEWorkbench/ConsumedServices';
import { GlobalPreferences } from './DEWorkbench/GlobalPreferences';
import { ViewManager } from './DEWorkbench/ViewManager';
export default {
    deWorkbench: null,
    toolbarPanel: null,
    subscriptions: null,
    loggerView: null,
    ink: null,
    cordovaPluginsProvidersManager: null,
    activate(state) {
        console.log("DEWB activated.");
        //require('devtron').install()
        //GlobalPreferences.getInstance();
        ServerManager.getInstance();
        this.cordovaPluginsProvidersManager = CordovaPluginsProvidersManager.getInstance();
        this.deferredActivation();
        //setTimeout(this.deferredActivation.bind(this),1000);
    },
    deferredActivation() {
        console.log("DEWB deferredActivation.");
        require('atom-package-deps').install('de-workbench', false).then(function (res) {
            console.log("Dep packages installed.");
        });
        let DEWorkbenchClass = require('./DEWorkbench/DEWorkbench').DEWorkbench;
        this.deWorkbench = new DEWorkbenchClass({});
        window["deWorkbench"] = this.deWorkbench; //make it public only for debugging purpose
        window["DEWBGlobalPreferences"] = GlobalPreferences.getInstance(); //make it public only for debugging purpose
        let value = 'HeaderPanel';
        this.toolbarPanel = atom.workspace[`add${value}`]({
            item: this.deWorkbench.getToolbarElement()
        });
        // add commands
        let commands = atom.commands.add('atom-workspace', {
            'dewb-menu-view-:toolbar-toggle': () => this.toggleToolbar(),
            'dewb-menu-view-:prjinspector-toggle': () => this.toggleProjectInspector(),
            'dewb-menu-view-:pushtool-show': () => this.showPushTool(),
            'dewb-menu-view-:servers-show': () => this.deWorkbench.viewManager.openView(ViewManager.VIEW_SERVERS),
            'dewb-menu-view-:bookmarks-toggle': () => this.deWorkbench.viewManager.openView(ViewManager.VIEW_BOOKMARKS),
            'dewb-menu-view-:loggerview-toggle': () => this.toggleLogger()
        });
        this.subscriptions = new CompositeDisposable();
        // add commands subs
        this.subscriptions.add(commands);
    },
    deactivate() {
        console.log('DEWB deactivated.');
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
    toggleProjectInspector() {
        this.deWorkbench.openProjectInspector();
    },
    toggleToolbar() {
        console.log("Toggle toolbar");
        this.deWorkbench.toggleToolbar();
    },
    toggleLogger() {
        console.log("Toggle Logger");
        this.deWorkbench.toggleLogger();
    },
    consumeInk: function (ink) {
        ConsumedServices.ink = ink;
        this.ink = ink;
    },
    provideCordovaPluginsProvider() {
        console.log("consumeDEWBCordovaPluginsProvider called");
        return CordovaPluginsProvidersManager.getInstance();
    },
    provideLogger() {
        console.log("consumeLogger called");
        return Logger.getInstance();
    },
    provideProjectManager() {
        console.log("provideProjectManager called");
        return ProjectManager.getInstance();
    },
    provideEventBus() {
        console.log("provideEventBus called");
        return EventBus.getInstance();
    },
    provideServerManager() {
        console.log("provideServerManager called");
        return ServerManager.getInstance();
    }
};
//# sourceMappingURL=main.js.map