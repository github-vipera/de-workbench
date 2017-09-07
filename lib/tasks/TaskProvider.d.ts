import { CordovaTaskConfiguration } from '../cordova/CordovaTasks';
export declare class TaskProvider {
    private static instance;
    private defaultTasks;
    private constructor();
    static getInstance(): TaskProvider;
    getDefaultTask(): CordovaTaskConfiguration[];
    createDefaultTasks(): Array<CordovaTaskConfiguration>;
}
