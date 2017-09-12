import { CordovaTaskConfiguration } from '../cordova/CordovaTasks';
export declare class TaskManager {
    private static instance;
    private defaultTasks;
    private constructor();
    static getInstance(): TaskManager;
    getDefaultTask(): CordovaTaskConfiguration[];
    createDefaultTasks(): Array<CordovaTaskConfiguration>;
}
