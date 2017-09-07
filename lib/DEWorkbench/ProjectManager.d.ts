import { Cordova } from '../cordova/Cordova';
export declare class ProjectManager {
    private static instance;
    private currentProjectPath;
    private events;
    cordova: Cordova;
    private constructor();
    static getInstance(): ProjectManager;
    private fireEditorChanged();
    private fireProjectChanged(projectPath);
    didProjectChanged(callback: Function): void;
    getCurrentProjectPath(): String;
}
