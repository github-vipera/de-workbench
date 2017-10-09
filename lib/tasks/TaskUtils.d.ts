import { CordovaProjectInfo } from '../cordova/Cordova';
import { PlatformServerConfig } from '../services/remote/PlatformServer';
import { CordovaTaskConfiguration, CordovaCliOptions } from '../cordova/CordovaTasks';
export declare class TaskUtils {
    private constructor();
    static createPlatformServerConfig(taskConfig: CordovaTaskConfiguration, project: CordovaProjectInfo): PlatformServerConfig;
    static getPlatformServerPort(platform: string): number;
    static createUniqueTaskName(tasks: Array<CordovaTaskConfiguration>, baseName?: string): string;
    static createCliOptions(taskConfig: CordovaTaskConfiguration): CordovaCliOptions;
}
