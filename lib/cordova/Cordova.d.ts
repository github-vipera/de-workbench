export declare class CordovaPlatform {
    name: string;
    version?: string;
    virtualRun?: boolean;
}
export declare class CordovaPlugin {
    name: string;
    id: string;
    version: string;
    description: string;
    isTopLevel: boolean;
    info: any;
    installed: boolean;
    author: string;
    homepage: string;
    license: string;
    repository: string;
    repositoryType: string;
    sourceType: string;
    lastUpdateTime: string;
    rating: number;
    localPath: string;
    platforms: Array<string>;
}
export interface NewProjectInfo {
    name: string;
    packageId: string;
    basePath: string;
    path: string;
    platforms: Array<string>;
    type: string;
    template: string;
}
export interface CordovaProjectInfo {
    path: string;
    name: string;
    displayName: string;
    description: string;
    author: string;
    license: string;
    version: string;
    platforms: Array<CordovaPlatform>;
    variants: Array<string>;
    projectSettings?: any;
    plugins?: Array<CordovaPlugin>;
    npmScripts?: Array<string>;
}
export declare class Cordova {
    private cordovaUtils;
    private sharedExecutor;
    constructor();
    isCordovaProject(projectRoot: string): Promise<boolean>;
    isCordovaProjectSync(projectRoot: string): boolean;
    getInstalledPlatforms(projectRoot: string): Promise<Array<CordovaPlatform>>;
    getInstalledPlatformsSync(projectRoot: string): Array<CordovaPlatform>;
    addPlatform(projectRoot: string, platformName: string): Promise<void>;
    removePlatform(projectRoot: string, platformName: string): Promise<void>;
    addPlugin(projectRoot: string, pluginInfo: CordovaPlugin): Promise<void>;
    removePlugin(projectRoot: string, pluginInfo: CordovaPlugin): Promise<void>;
    getInstalledPlugins(projectRoot: string): Promise<Array<CordovaPlugin>>;
    getPlatformPath(projectRoot: string, platform: string): string;
    createNewProject(projectInfo: NewProjectInfo): Promise<any>;
    removeAllPlatforms(projectInfo: any): Promise<any>;
    addPlatforms(projectInfo: any): Promise<any>;
    removePlatforms(projectRoot: string, platformList: Array<String>): Promise<any>;
    private rejectForBusySharedExecutor();
    buildProject(projectRoot: string, platform: string, options: any): Promise<any>;
    cleanProject(projectRoot: string, platform: string): Promise<any>;
    isBusy(): boolean;
    prepareProject(projectRoot: string, platform: string, cliOptions?: any): Promise<any>;
    prepareProjectWithBrowserPatch(projectRoot: string, platform?: string, cliOptions?: any): Promise<any>;
    runProject(projectRoot: string, platform: string, target: string, options: any): Promise<any>;
    getPackageJson(projectRoot: string): any;
    storePackageJson(projectRoot: string, packageJson: Object): void;
    stopExecutor(): void;
    markInstalledPlugins(pluginList: Array<CordovaPlugin>, installedPlugins: Array<CordovaPlugin>): Array<CordovaPlugin>;
    getProjectInfo(projectRoot: string, loadPlugins?: boolean): Promise<CordovaProjectInfo>;
    saveProjectInfo(projectRoot: string, projectInfo: CordovaProjectInfo): Promise<any>;
}
