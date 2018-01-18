import { CordovaPlatform } from './Cordova';
import { CordovaDevice } from './CordovaDeviceManager';
export declare type CordovaTaskType = "prepare" | "compile" | "build" | "run" | "buildRun";
export interface TaskConstraints {
    isDeviceEnabled: boolean;
    isMockConfigEnabled: boolean;
    isNodeTaskEnabled: boolean;
    isVariantEnabled: boolean;
    isEnvVarEnabled: boolean;
    isCustom?: boolean;
}
export interface CordovaCliOptions {
    flags: Array<string>;
    envVariables: Array<{
        name: string;
        value: string;
    }>;
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
    private _cliParams;
    private _constraints;
    constructor(name?: string, taskType?: CordovaTaskType);
    readonly id: string;
    name: string;
    readonly longDisplayName: string;
    displayName: string;
    taskType: CordovaTaskType;
    selectedPlatform: CordovaPlatform;
    variantName: string;
    isRelease: boolean;
    nodeTasks: Array<string>;
    constraints: TaskConstraints;
    device: CordovaDevice;
    envVariables: Array<{
        name: string;
        value: string;
    }>;
    cliParams: Array<string>;
    static fromJSON(json: Object): CordovaTaskConfiguration;
    static toJSON(taskConfig: CordovaTaskConfiguration): string;
}
export declare abstract class CordovaTask {
    private _name;
    private _configuration;
    constructor(name: string, configuration?: CordovaTaskConfiguration);
    readonly name: string;
    configuration: CordovaTaskConfiguration;
}
