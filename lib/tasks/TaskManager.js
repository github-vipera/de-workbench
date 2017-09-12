'use babel';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { ProjectManager } from '../DEWorkbench/ProjectManager';
import { TaskUtils } from './TaskUtils';
import { Logger } from '../logger/Logger';
import { ScriptExecutor } from './ScriptExecutor';
import { RuntimeSessionHandler } from '../services/remote/RuntimeSessionHandler';
import { EventEmitter } from 'events';
const RUNTIME_SESSION_AVAILABLE_EVT_NAME = "";
export class TaskManager {
    constructor() {
        this.scriptExecutor = null;
        this.reloadContext = {};
        this.cordova = ProjectManager.getInstance().cordova;
        this.events = new EventEmitter();
    }
    executeTask(taskConfig, project) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isBusy()) {
                throw new Error("TaskManager is busy");
            }
            let cliOptions = TaskUtils.createCliOptions(taskConfig);
            Logger.getInstance().info("cliOptions:", JSON.stringify(cliOptions));
            yield this.scheduleNodeScripts(taskConfig, project, cliOptions);
            this.currentTask = taskConfig;
            this.project = project;
            Logger.getInstance().debug('schedule node tasks');
            try {
                switch (this.currentTask.taskType) {
                    case "prepare":
                        yield this.executePrepare(project, cliOptions);
                        this.currentTask = null;
                        break;
                    case "build":
                        yield this.executeBuild(project, cliOptions);
                        this.currentTask = null;
                        break;
                    case "run":
                        yield this.executeRun(project, cliOptions);
                        this.currentTask = null;
                        break;
                    case "buildRun":
                        yield this.executeBuild(project, cliOptions);
                        yield this.executeRun(project, cliOptions);
                        this.currentTask = null;
                        break;
                }
            }
            catch (err) {
                this.currentTask = null;
                throw err;
            }
        });
    }
    executeTaskChain(taskChain, project) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let task of taskChain) {
                yield this.executeTask(task, project);
            }
        });
    }
    isBusy() {
        return this.currentTask != null;
    }
    executeBuild(project, cliOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            let platform = this.currentTask.selectedPlatform ? this.currentTask.selectedPlatform.name : null;
            return this.cordova.buildProject(project.path, platform, cliOptions);
        });
    }
    executeRun(project, cliOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.startPlatformServer(project);
            this.fireRuntimeSessionAvailable();
            this.reloadContext.cliOptions = cliOptions;
            this.reloadContext.project = project;
            this.reloadContext.runTask = this.currentTask;
            let platform = this.currentTask.selectedPlatform ? this.currentTask.selectedPlatform.name : null;
            this.applyPlatformSpecificFlags(platform, cliOptions);
            let target = this.currentTask.device ? this.currentTask.device.targetId : null;
            return this.cordova.runProject(project.path, platform, target, cliOptions);
        });
    }
    applyPlatformSpecificFlags(platform, cliOptions) {
        if (platform === 'browser') {
            cliOptions.flags ? cliOptions.flags.push('--noprepare') : ['--noprepare'];
            cliOptions.flags.push('--port=' + parseInt(atom.config.get('de-workbench.BrowserEmulationPort')));
        }
    }
    executePrepare(project, cliOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            let platform = this.currentTask.selectedPlatform ? this.currentTask.selectedPlatform.name : null;
            return this.cordova.prepareProject(project.path, platform, cliOptions);
        });
    }
    startPlatformServer(project) {
        return __awaiter(this, void 0, void 0, function* () {
            let platform = this.currentTask.selectedPlatform;
            if (!platform) {
                Logger.getInstance().warn("No platform detected: server not started");
                return Promise.resolve();
            }
            if (this.isPlatformServerRunning()) {
                Logger.getInstance().warn("Platform server already started");
                return Promise.resolve();
            }
            Logger.getInstance().info(`Platform Server for ${platform} starting`);
            const srvConf = TaskUtils.createPlatformServerConfig(this.currentTask, project);
            if (!srvConf) {
                Logger.getInstance().error("Server configuration build fail");
                return Promise.resolve();
            }
            yield this.cordova.prepareProjectWithBrowserPatch(project.path, platform.name);
            this.runtimeSessionHandler = RuntimeSessionHandler.createRuntimeSession(srvConf);
        });
    }
    stopServer() {
        if (this.runtimeSessionHandler) {
            this.runtimeSessionHandler.stopServer().then(() => {
                Logger.getInstance().info("Server stop done");
                this.reloadContext = {};
            }, () => {
                Logger.getInstance().error("Server stop fail");
            });
        }
    }
    stop() {
        if (this.scriptExecutor) {
            this.scriptExecutor.stop();
        }
        this.cordova.stopExecutor();
        this.stopServer();
    }
    isPlatformServerRunning() {
        return this.runtimeSessionHandler && this.runtimeSessionHandler.isPlatformServerRunning();
    }
    /**
     * Async action execution
     * @param  {LiveActions} action runtime action to execute
     */
    sendAction(action) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isPlatformServerRunning()) {
                Logger.getInstance().debug("sendAction ", action.type);
                yield this.execActionTask(action);
                yield this.runtimeSessionHandler.sendAction(action);
                return Promise.resolve();
            }
            return Promise.resolve();
        });
    }
    execActionTask(action) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.scheduleNodeScripts(this.reloadContext.runTask, this.reloadContext.project, this.reloadContext.cliOptions);
            if (action.type == "doLiveReload") {
                let platform = this.reloadContext.runTask.selectedPlatform ? this.reloadContext.runTask.selectedPlatform.name : null;
                yield this.cordova.prepareProjectWithBrowserPatch(this.reloadContext.project.path, platform, this.reloadContext.cliOptions);
            }
            return Promise.resolve();
        });
    }
    scheduleNodeScripts(taskConfig, project, cliOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!taskConfig.nodeTasks || !(taskConfig.nodeTasks.length > 0)) {
                Logger.getInstance().debug('No script defined');
                return Promise.resolve();
            }
            Logger.getInstance().debug('Begin npm script run');
            this.scriptExecutor = new ScriptExecutor();
            let res = yield this.scriptExecutor.runNpmScripts(taskConfig.nodeTasks, project.path);
            Logger.getInstance().debug('End npm script run');
            return res;
        });
    }
    getRuntimeSessionHandler() {
        return this.runtimeSessionHandler;
    }
    fireRuntimeSessionAvailable() {
        this.events.emit(RUNTIME_SESSION_AVAILABLE_EVT_NAME);
    }
    didRuntimeSessionAvailable(callback) {
        this.events.addListener(RUNTIME_SESSION_AVAILABLE_EVT_NAME, callback);
    }
}
//# sourceMappingURL=TaskManager.js.map