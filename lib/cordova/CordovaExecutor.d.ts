import { CommandExecutor } from '../utils/CommandExecutor';
export declare class CordovaExecutor extends CommandExecutor {
    constructor(path: string);
    /**
     * Creates a new Cordova project with the given parameters
     */
    createNewProject(projectInfo: any): Promise<any>;
    removeAllPlatforms(projectInfo: any): Promise<any>;
    addPlatforms(projectInfo: any): Promise<any>;
    execNpmInstall(path: string): Promise<{}>;
    removePlatforms(platformList: any, path: string): Promise<{}>;
    getInstalledPlatforms(rootProjectPath: string): any;
}
