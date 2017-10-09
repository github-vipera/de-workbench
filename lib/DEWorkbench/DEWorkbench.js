'use babel';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { ToolbarView } from '../toolbar/ToolbarView';
import { NewProjectView } from '../views/NewProject/NewProjectView';
import { EventEmitter } from 'events';
const { CompositeDisposable } = require('atom');
import { ProjectManager } from '../DEWorkbench/ProjectManager';
import { Logger } from '../logger/Logger';
import { TaskConfigView } from '../views/TaskConfig/TaskConfigView';
import { TaskManager } from '../tasks/TaskManager';
import { UIIndicatorStatus } from '../ui-components/UIStatusIndicatorComponent';
import { BookmarkManager } from './BookmarkManager';
import { ViewManager } from './ViewManager';
import { attachEventFromObject } from '../element/index';
export class DEWorkbench {
    constructor(options) {
        Logger.getInstance().info("Initializing DEWorkbench...");
        this._viewManager = new ViewManager();
        this.projectManager = ProjectManager.getInstance();
        BookmarkManager.getInstance();
        this.events = new EventEmitter();
        this.toolbarView = new ToolbarView({
            didNewProject: () => {
                this.showNewProjectModal();
            },
            didToggleToolbar: () => {
                this.toggleToolbar();
            },
            didToggleDebugArea: () => {
                this.toggleDebugArea();
            },
            didProjectSettings: () => {
                this.showProjectSettings();
            },
            didToggleConsole: () => {
                this.toggleLogger();
            },
            didSelectProjectForRun: (projectInfo) => {
                Logger.consoleLog("didSelectProjectForRun", projectInfo);
                this.selectedProjectForTask = projectInfo;
            },
            didSelectTaskClick: () => {
                Logger.consoleLog("didSelectTaskClick");
                this.showCordovaTaskModal();
            },
            didTaskSelected: (task) => {
                this.onTaskSelected(task);
            },
            didStop: () => {
                this.onStopTask();
            },
            didRun: () => {
                this.onTaskRunRequired(this.taskConfiguration);
            },
            didReload: () => {
                Logger.consoleLog('Reload');
                this.getTaskManager().sendAction({
                    type: 'doLiveReload'
                });
            },
            didOpenJSConsole: () => {
                Logger.consoleLog('didOpenJSConsole');
                let runtimeHandler = this.getTaskManager().getRuntimeSessionHandler();
                if (runtimeHandler && runtimeHandler.canOpenJSSession()) {
                    let consoleHandler = runtimeHandler.openConsole();
                }
            }
        });
        attachEventFromObject(this.events, [
            'didToggleToolbar'
        ], options);
        ProjectManager.getInstance().didProjectChanged((projectPath) => this.onProjectChanged(projectPath));
        this.events.on('didRunTask', this.onTaskRunRequired.bind(this));
        this.events.on('didTaskSelected', this.onTaskSelected.bind(this));
        this.events.on('didStoreTasks', this.onStoreTasks.bind(this));
        DEWorkbench._instance = this;
        let commands = atom.commands.add('atom-workspace', {
            'dewb-menu-view-:debug-breakpoint-toggle': () => this.toggleBreakpointsView(),
            'dewb-menu-view-:debug-call-stack-toggle': () => this.toggleCallStackView(),
            'dewb-menu-view-:debug-variables-toggle': () => this.toggleVariablesView(),
            'dewb-menu-view-:debug-watch-expressions-toggle': () => this.toggleWatchExpressionsView()
        });
        Logger.getInstance().info("DEWorkbench initialized successfully.");
    }
    static get default() {
        return this._instance;
    }
    showNewProjectModal() {
        let newProjectView = new NewProjectView();
        newProjectView.open();
    }
    toggleBreakpointsView() {
        this.viewManager.toggleView(ViewManager.VIEW_DEBUG_BREAKPOINTS);
    }
    toggleCallStackView() {
        this.viewManager.toggleView(ViewManager.VIEW_DEBUG_CALL_STACK);
    }
    toggleVariablesView() {
        this.viewManager.toggleView(ViewManager.VIEW_DEBUG_VARIABLES);
    }
    toggleWatchExpressionsView() {
        this.viewManager.toggleView(ViewManager.VIEW_DEBUG_WATCH_EXPRESSIONS);
    }
    onProjectChanged(projectPath) {
        Logger.getInstance().debug("DEWorkbench onProjectChanged: ", projectPath);
    }
    openProjectInspector() {
    }
    openDebugArea() {
        this.viewManager.openView(ViewManager.VIEW_DEBUG_BREAKPOINTS);
    }
    showProjectSettings() {
        let currentprojectPath = ProjectManager.getInstance().getCurrentProjectPath();
        if (currentprojectPath) {
            this.viewManager.openView(ViewManager.VIEW_PROJECT_SETTINGS(currentprojectPath));
        }
    }
    toggleToolbar() {
        this.toolbarView.toggle();
    }
    toggleDebugArea() {
        this.events.emit('didToggleDebugArea');
        this.viewManager.toggleView(ViewManager.VIEW_DEBUG_BREAKPOINTS);
    }
    toggleLogger() {
        this.events.emit('didToggleLogger');
        this.viewManager.toggleView(ViewManager.VIEW_LOG_INSPECTOR);
    }
    getToolbarElement() {
        return this.toolbarView.getElement();
    }
    showCordovaTaskModal() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.selectedProjectForTask == null) {
                Logger.getInstance().warn("select project before run task");
                return;
            }
            let taskConfigView = new TaskConfigView("Task Configuration", this.events);
            this.selectedProjectForTask = yield this.projectManager.cordova.getProjectInfo(this.selectedProjectForTask.path, false);
            taskConfigView.setProject(this.selectedProjectForTask);
            taskConfigView.show();
        });
    }
    onStoreTasks(taskConfiguration) {
        if (taskConfiguration) {
            this.onTaskSelected(taskConfiguration, true);
        }
    }
    onTaskSelected(taskConfiguration, forceUpdate) {
        Logger.consoleLog("onTaskSelected", taskConfiguration);
        this.taskConfiguration = taskConfiguration;
        if (!taskConfiguration) {
            Logger.getInstance().warn("Null task selected");
            this.toolbarView.setTaskConfiguration(null);
            return;
        }
        if (forceUpdate) {
            this.toolbarView.setTaskConfiguration(taskConfiguration);
        }
    }
    onTaskRunRequired(taskConfiguration) {
        Logger.consoleLog("onTaskRunRequired", taskConfiguration);
        this.taskConfiguration = taskConfiguration;
        if (!taskConfiguration) {
            Logger.getInstance().warn("Null task selected");
            this.toolbarView.setTaskConfiguration(null);
            return;
        }
        Logger.getInstance().info("Require execute of task", taskConfiguration.name, this.selectedProjectForTask);
        this.toolbarView.setTaskConfiguration(taskConfiguration);
        let project = this.selectedProjectForTask;
        let platform = taskConfiguration.selectedPlatform ? taskConfiguration.selectedPlatform.name : "";
        this.toolbarView.setInProgressStatus(`${taskConfiguration.displayName} - ${platform}  in progress...`);
        this.getTaskManager().executeTask(taskConfiguration, project).then(() => {
            Logger.getInstance().info(`${taskConfiguration.displayName} Done`);
            this.updateToolbarStatus(taskConfiguration, true);
        }, (reason) => {
            Logger.getInstance().error(reason);
            this.updateToolbarStatus(taskConfiguration, false);
        }).catch((err) => {
            Logger.getInstance().error(err.message, err.stack);
            this.updateToolbarStatus(taskConfiguration, false);
        });
    }
    onStopTask() {
        Logger.consoleLog("onStopTask");
        if (this.taskManager) {
            this.taskManager.stop();
            this.updateToolbarStatus(this.taskConfiguration, false);
        }
    }
    updateToolbarStatus(taskConfiguration, taskDone) {
        let project = this.selectedProjectForTask;
        let platform = taskConfiguration.selectedPlatform ? taskConfiguration.selectedPlatform.name : "";
        if (this.taskManager) {
            let busy = this.taskManager.isBusy();
            let serverRunning = this.taskManager.isPlatformServerRunning();
            Logger.consoleLog(`updateToolbarStatus busy ${busy} -  serverRunning ${serverRunning}`);
            if (busy) {
                this.toolbarView.setInProgressStatus(`${taskConfiguration.displayName} - ${platform}  in progress...`);
                if (serverRunning) {
                    this.toolbarView.updateStatus({
                        btnReloadEnable: true,
                        btnOpenJSConsoleEnable: true,
                    });
                }
                return;
            }
            if (serverRunning) {
                if (taskDone) {
                    this.toolbarView.updateStatus({
                        prjSelectorEnable: false,
                        btnStopEnable: true,
                        btnRunEnable: true,
                        btnReloadEnable: true,
                        btnOpenJSConsoleEnable: true,
                        progressStatus: UIIndicatorStatus.Busy,
                        progressIcon: 'status-success',
                        progressMsg: 'Server running'
                    });
                }
                else {
                    this.toolbarView.updateStatus({
                        prjSelectorEnable: false,
                        btnRunEnable: true,
                        btnStopEnable: true,
                        btnReloadEnable: false,
                        btnOpenJSConsoleEnable: false,
                        progressIcon: 'status-error',
                        progressStatus: UIIndicatorStatus.Error,
                        progressMsg: `${taskConfiguration.displayName} - ${platform} Fail (Server running)`
                    });
                }
            }
            else {
                this.toolbarView.updateStatus({
                    btnReloadEnable: false,
                    btnOpenJSConsoleEnable: false,
                });
                if (taskDone) {
                    this.toolbarView.setSuccessStatus(`${taskConfiguration.displayName} - ${platform} Done`);
                }
                else {
                    this.toolbarView.setErrorStatus(`${taskConfiguration.displayName} - ${platform} Fail`);
                }
            }
        }
    }
    getTaskManager() {
        if (!this.taskManager) {
            this.taskManager = new TaskManager();
            this.taskManager.didRuntimeSessionAvailable(() => {
                Logger.consoleLog("didRuntimeSessionAvailable exec");
                this.updateToolbarStatus(this.taskConfiguration, false);
            });
        }
        return this.taskManager;
    }
    destroy() {
        Logger.getInstance().info("DEWorkbench destroying...");
    }
    get viewManager() {
        return this._viewManager;
    }
}
//# sourceMappingURL=DEWorkbench.js.map