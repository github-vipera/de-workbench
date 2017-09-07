import { CordovaPlatform } from '../cordova/Cordova';
export declare class ProjectInspectorView {
    private element;
    private events;
    private panel;
    private item;
    private atomWorkspace;
    private currentProjectPath;
    private cordova;
    private installedPlatormsElement;
    constructor();
    open(): void;
    close(): void;
    onProjectChanged(projectPath: string): void;
    displayInstalledPlatforms(platforms: Array<CordovaPlatform>): void;
}
