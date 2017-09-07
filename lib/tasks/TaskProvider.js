'use babel';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { CordovaTaskConfiguration } from '../cordova/CordovaTasks';
import { forEach } from 'lodash';
import { ProjectManager } from '../DEWorkbench/ProjectManager';
const CORDOVA_TASK_LIST_KEY = 'cdvTaskList';
export class TaskProvider {
    constructor() {
        this.defaultTasks = null;
        console.log("Create TaskProvider");
    }
    static getInstance() {
        if (!TaskProvider.instance) {
            TaskProvider.instance = new TaskProvider();
        }
        return TaskProvider.instance;
    }
    getDefaultTask() {
        if (this.defaultTasks == null) {
            this.defaultTasks = this.createDefaultTasks();
        }
        return this.defaultTasks;
    }
    createDefaultTasks() {
        let cdvPrepare = new CordovaTaskConfiguration('CordovaPrepare', 'prepare');
        cdvPrepare.displayName = 'Prepare';
        cdvPrepare.constraints = {
            isDeviceEnabled: false,
            isMockConfigEnabled: false,
            isEnvVarEnabled: true,
            isVariantEnabled: true,
            isNodeTaskEnabled: true
        };
        let cdvBuild = new CordovaTaskConfiguration('CordovaBuid', 'build');
        cdvBuild.displayName = 'Build';
        cdvBuild.constraints = {
            isDeviceEnabled: false,
            isMockConfigEnabled: false,
            isEnvVarEnabled: true,
            isVariantEnabled: true,
            isNodeTaskEnabled: true
        };
        let cdvRun = new CordovaTaskConfiguration('CordovaRun', 'run');
        cdvRun.displayName = 'Run';
        cdvRun.constraints = {
            isDeviceEnabled: true,
            isMockConfigEnabled: false,
            isEnvVarEnabled: true,
            isVariantEnabled: true,
            isNodeTaskEnabled: true
        };
        let cdvBuildAndRun = new CordovaTaskConfiguration('CordovaBuidRun', 'buildRun');
        cdvBuildAndRun.displayName = 'Build & Run';
        cdvBuildAndRun.constraints = {
            isDeviceEnabled: true,
            isMockConfigEnabled: false,
            isEnvVarEnabled: true,
            isVariantEnabled: true,
            isNodeTaskEnabled: true
        };
        let tasks = [cdvPrepare, cdvBuild, cdvRun, cdvBuildAndRun];
        return tasks;
    }
    loadTasksForProject(projectPath) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('loadTasksForProject');
            let defaultTasks = this.getDefaultTask();
            if (!projectPath) {
                return defaultTasks;
            }
            let setting = undefined;
            try {
                setting = yield ProjectManager.getInstance().getProjectSettings(projectPath);
            }
            catch (ex) {
                console.error(ex);
            }
            if (!setting) {
                return defaultTasks;
            }
            let savedTasks = setting.get('cdvTaskList');
            console.log("savedTasks", savedTasks);
            if (!savedTasks) {
                return defaultTasks;
            }
            let parsedResult = [];
            forEach(savedTasks, (item) => {
                parsedResult.push(CordovaTaskConfiguration.fromJSON(item));
            });
            console.log("parsedResult:", savedTasks);
            return parsedResult;
        });
    }
    storeTasks(cdvTaskList, projectPath) {
        return __awaiter(this, void 0, void 0, function* () {
            let setting = yield ProjectManager.getInstance().getProjectSettings(projectPath);
            setting.save(CORDOVA_TASK_LIST_KEY, cdvTaskList);
        });
    }
}
//# sourceMappingURL=TaskProvider.js.map