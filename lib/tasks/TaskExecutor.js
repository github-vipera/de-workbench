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
import { PlatformServerImpl } from '../services/remote/PlatformServer';
import { TaskUtils } from './TaskUtils';
import { Logger } from '../logger/Logger';
import { ScriptExecutor } from './ScriptExecutor';
export class TaskExecutor {
    constructor() {
        this.platformServer = null;
        this.scriptExecutor = null;
        this.cordova = ProjectManager.getInstance().cordova;
    }
    executeTask(taskConfig, project) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isBusy()) {
                throw new Error("TaskExecutor is busy");
            }
            yield this.scheduleNodeScripts(taskConfig, project);
            this.currentTask = taskConfig;
            Logger.getInstance().debug('schedule node tasks');
            try {
                switch (this.currentTask.taskType) {
                    case "prepare":
                        yield this.executePrepare(project);
                        this.currentTask = null;
                        break;
                    case "build":
                        yield this.executeBuild(project);
                        this.currentTask = null;
                        break;
                    case "run":
                        yield this.executeRun(project);
                        this.currentTask = null;
                    case "buildRun":
                        yield this.executeBuild(project);
                        // TODO publish progress
                        yield this.executeRun(project);
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
    executeBuild(project) {
        return __awaiter(this, void 0, void 0, function* () {
            let platform = this.currentTask.selectedPlatform ? this.currentTask.selectedPlatform.name : null;
            return this.cordova.buildProject(project.path, platform, {});
        });
    }
    executeRun(project) {
        return __awaiter(this, void 0, void 0, function* () {
            this.startPlatformServer(project);
            let platform = this.currentTask.selectedPlatform ? this.currentTask.selectedPlatform.name : null;
            return this.cordova.runProject(project.path, platform, null, {});
        });
    }
    executePrepare(project) {
        return __awaiter(this, void 0, void 0, function* () {
            let platform = this.currentTask.selectedPlatform ? this.currentTask.selectedPlatform.name : null;
            return this.cordova.prepareProject(project.path, platform);
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
            yield this.cordova.prepareProjectWithBrowserPatch(project.path);
            this.platformServer = PlatformServerImpl.createNew();
            this.platformServer.start(srvConf);
        });
    }
    stopServer() {
        if (this.platformServer) {
            this.platformServer.stop().then(() => {
                Logger.getInstance().info("Server stop done");
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
        return this.platformServer && this.platformServer.isRunning();
    }
    scheduleNodeScripts(taskConfig, project) {
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
}
//# sourceMappingURL=TaskExecutor.js.map