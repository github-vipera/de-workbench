import { CommandExecutor } from '../utils/CommandExecutor';
export declare const DEVICE_AUTO_DEF = "[AUTO]";
export declare class CordovaExecutor extends CommandExecutor {
    constructor(projectRoot: string);
    createNewProject(projectInfo: any): Promise<any>;
    removeAllPlatforms(projectInfo: any): Promise<any>;
    addPlatform(projectInfo: any, platformName: string): Promise<any>;
    addPlatforms(projectInfo: any): Promise<any>;
    execNpmInstall(projectRoot: string): Promise<{}>;
    addPlugin(projectInfo: any, pluginSpec: any, installOpt: any): Promise<any>;
    removePlugin(projectInfo: any, pluginSpec: any): Promise<any>;
    removePlatforms(platformList: any, projectRoot: string): Promise<{}>;
    getInstalledPlatforms(rootProjectPath: string): any;
    runBuild(projectRoot: string, platform: string, cliOptions: any): Promise<{}>;
    runClean(projectRoot: string, platform: string): Promise<{}>;
    runPrepare(projectRoot: string, platform?: string, cliOptions?: any): Promise<{}>;
    runPrepareWithBrowserPatch(projectRoot: string, platform?: string, cliOptions?: any): Promise<{}>;
    private patchExtraBrowserFile(projectRoot);
    private applyGlobalCliOptions(cliOptions);
    private getGlobalEnvCloneWithOptions(cliOptions);
    private createPrepare(platform);
    runProject(projectRoot: string, platform: string, target: string, cliOptions: any): Promise<{}>;
    getAllDeviceByPlatform(platform: string): Promise<any>;
    stopSpawn(): void;
    isBusy(): boolean;
}
