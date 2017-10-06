'use babel';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const { CompositeDisposable } = require('atom');
import { Logger } from './logger/Logger';
import { CordovaPluginsProvidersManager } from './DEWorkbench/services/CordovaPluginsProvidersManager';
import { ServerManager } from '././DEWorkbench/services/ServerManager';
import { ProjectManager } from './DEWorkbench/ProjectManager';
import { EventBus } from './DEWorkbench/EventBus';
import { ConsumedServices } from './DEWorkbench/ConsumedServices';
import { GlobalPreferences } from './DEWorkbench/GlobalPreferences';
import { ViewManager } from './DEWorkbench/ViewManager';
import { DEUtils } from './utils/DEUtils';
import { UINotifications } from './ui-components/UINotifications';
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
            'dewb-menu-view-:loggerview-toggle': () => this.toggleLogger(),
            'dewb-menu-view-:test-command': () => this.testCommand(),
            'dewb-menu-view-:install-de-cli': () => this.installDECli()
        });
        this.subscriptions = new CompositeDisposable();
        this.subscriptions.add(commands);
        this.checkForDECli();
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
    testCommand() {
        return __awaiter(this, void 0, void 0, function* () {
            Logger.consoleLog("DE CLI checking...");
            let x = yield DEUtils.checkForDECli();
            Logger.consoleLog("DE CLI available: " + x);
        });
    },
    checkForDECli() {
        return __awaiter(this, void 0, void 0, function* () {
            let deCliOK = yield DEUtils.checkForDECli();
            if (!deCliOK) {
                let notification = UINotifications.showInfo("DE CLI Not Installed.", {
                    dismissable: true,
                    buttons: [
                        {
                            text: 'Do Install',
                            onDidClick: () => {
                                notification.dismiss();
                                this.installDECli();
                            }
                        },
                        {
                            text: 'Cancel',
                            onDidClick: () => {
                                notification.dismiss();
                            }
                        }
                    ],
                    detail: "La DE CLI non sembra essere installata. Vuoi procedere ora con l'installazione?"
                });
            }
        });
    },
    installDECli() {
        return __awaiter(this, void 0, void 0, function* () {
            let installRunningNotification = UINotifications.showInfo("Installing DE CLI...", { dismissable: true });
            let ok = yield DEUtils.installDECli();
            if (ok) {
                installRunningNotification.dismiss();
                UINotifications.showSuccess("DE CLI installed successfully.");
            }
            else {
                installRunningNotification.dismiss();
                UINotifications.showError("Error installing the DE CLI. See the log for more details.");
            }
        });
    }
};
//# sourceMappingURL=main.js.map