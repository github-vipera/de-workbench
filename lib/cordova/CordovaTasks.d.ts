import { CordovaPlatform } from './Cordova';
import { CordovaDevice } from './CordovaDeviceManager';
export interface MockConfiguration {
    mockFilePath: string;
    jsLibraryLoaderPath?: string;
}
export declare type CordovaTaskType = "prepare" | "compile" | "build" | "run" | "buildRun";
export interface TaskConstraints {
    isDeviceEnabled: boolean;
    isMockConfigEnabled: boolean;
    mockConfig?: MockConfiguration;
    isNodeTaskEnabled: boolean;
    isEnvVarEnabled: boolean;
}
export declare class CordovaTaskConfiguration {
    private _name;
    private _displayName;
    private _taskType;
    private _selectedPlatform;
    private _variantName;
    private _isRelease;
    private _nodeTasks;
    private _device;
    private _envVariables;
    private _constraints;
    constructor(name?: string, taskType?: CordovaTaskType);
    name: string;
    displayName: string;
    taskType: CordovaTaskType;
    selectedPlatform: CordovaPlatform;
    variantName: string;
    isRelease: boolean;
    nodeTasks: Array<String>;
    constraints: TaskConstraints;
    device: CordovaDevice;
    envVariables: Array<{
        name: string;
        value: string;
    }>;
    static fromJSON(json: Object): CordovaTaskConfiguration;
    static toJSON(taskConfig: CordovaTaskConfiguration): string;
}
export declare class CordovaRunConfiguration extends CordovaTaskConfiguration {
    private _mockConfig;
    constructor();
    mockConfig: MockConfiguration;
}
export declare abstract class CordovaTask {
    private _name;
    private _configuration;
    constructor(name: string, configuration?: CordovaTaskConfiguration);
    readonly name: string;
    configuration: CordovaTaskConfiguration;
}
