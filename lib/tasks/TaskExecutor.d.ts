import { CordovaProjectInfo } from '../cordova/Cordova';
import { CordovaTaskConfiguration } from '../cordova/CordovaTasks';
export declare class TaskExecutor {
    private currentTask;
    private cordova;
    constructor();
    executeTask(taskConfig: CordovaTaskConfiguration, project: CordovaProjectInfo): Promise<any>;
    executeTaskChain(taskChain: Array<CordovaTaskConfiguration>, project: CordovaProjectInfo): Promise<void>;
    isBusy(): boolean;
    executeBuild(project: CordovaProjectInfo): Promise<any>;
    executeRun(project: CordovaProjectInfo): Promise<any>;
    executePrepare(project: CordovaProjectInfo): Promise<any>;
    stop(): void;
}
