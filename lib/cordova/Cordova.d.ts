export declare class CordovaPlatform {
    name: string;
    version: string;
    virtualRun: boolean;
}
export declare class CordovaPlugin {
    name: string;
    id: string;
    version: string;
    description: string;
    isTopLevel: boolean;
    info: any;
}
export declare class Cordova {
    private cordovaUtils;
    private cordovaPluginScanner;
    constructor();
    /**
     * Returns a list of installed platforms for a Cordova Project
     */
    getInstalledPlatforms(projectRoot: string): Promise<Array<CordovaPlatform>>;
    /**
     * Returns a list of installed platforms for a Cordova Project in a sync way
     */
    getInstalledPlatformsSync(projectRoot: string): Array<CordovaPlatform>;
    /**
     * Returns a list of installed plugins for a Cordova Project
     */
    getInstalledPlugins(projectRoot: string): Promise<Array<CordovaPlugin>>;
    /**
     * Add a new plugin to a Cordova project
     **/
    addPlugin(projectRoot: string, pluginSpec: string, installOpt: any): Promise<string>;
    /**
     * Remove a plugin from a Cordova project
     **/
    removePlugin(projectRoot: string, pluginSpec: string): Promise<string>;
    /**
     * Returns the assets path for the given platform
     */
    getPlatformPath(projectRoot: string, platform: string): string;
    /**
     * Creates a new Cordova project with the given parameters
     */
    createNewProject(projectInfo: any): Promise<any>;
    /**
     * Creates a new Cordova project with the given parameters
     */
    removeAllPlatforms(projectInfo: any): Promise<any>;
    /**
     * Adds platforms to a project
     */
    addPlatforms(projectInfo: any): Promise<any>;
    /**
     * Removes platforms from project
     **/
    removePlatforms(projectRoot: string, platformList: Array<String>): Promise<any>;
    buildProject(projectRoot: string, platform: string, options: any): Promise<any>;
    cleanProject(projectRoot: string, platform: string, options: any): Promise<any>;
    prepareProject(projectRoot: string, platform: string, options: any): Promise<any>;
    runProject(projectRoot: string, platform: string, options: any): Promise<any>;
}
