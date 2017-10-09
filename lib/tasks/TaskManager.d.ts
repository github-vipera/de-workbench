import { CordovaProjectInfo } from '../cordova/Cordova';
import { CordovaTaskConfiguration, CordovaCliOptions } from '../cordova/CordovaTasks';
import { LiveActions } from '../services/remote/PlatformServer';
import { RuntimeSessionHandler } from '../services/remote/RuntimeSessionHandler';
export interface LiveReloadContext {
    runTask?: CordovaTaskConfiguration;
    project?: CordovaProjectInfo;
    cliOptions?: CordovaCliOptions;
}
export declare class TaskManager {
    private currentTask;
    private project;
    private runtimeSessionHandler;
    private scriptExecutor;
    private cordova;
    private events;
    private reloadContext;
    constructor();
    executeTask(taskConfig: CordovaTaskConfiguration, project: CordovaProjectInfo): Promise<any>;
    executeTaskChain(taskChain: Array<CordovaTaskConfiguration>, project: CordovaProjectInfo): Promise<void>;
    isBusy(): boolean;
    executeBuild(project: CordovaProjectInfo, cliOptions: CordovaCliOptions): Promise<any>;
    executeRun(project: CordovaProjectInfo, cliOptions: CordovaCliOptions): Promise<any>;
    applyPlatformSpecificFlags(platform: string, cliOptions: CordovaCliOptions): void;
    executePrepare(project: CordovaProjectInfo, cliOptions: CordovaCliOptions): Promise<any>;
    private startPlatformServer(project);
    stopServer(): void;
    stop(): void;
    isPlatformServerRunning(): boolean;
    sendAction(action: LiveActions): Promise<void>;
    private execActionTask(action);
    private scheduleNodeScripts(taskConfig, project, cliOptions);
    getRuntimeSessionHandler(): RuntimeSessionHandler;
    private fireRuntimeSessionAvailable();
    didRuntimeSessionAvailable(callback: (...args: any[]) => void): void;
}
