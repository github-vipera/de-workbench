import { Cordova } from '../cordova/Cordova';
import { ProjectSettings } from './ProjectSettings';
export declare class ProjectManager {
    private static instance;
    private currentProjectPath;
    private events;
    cordova: Cordova;
    private projectSettings;
    private constructor();
    static getInstance(): ProjectManager;
    private firePathChanged();
    getFirstAvailableProjectRootFolder(): string;
    getAllAvailableProjects(): Array<any>;
    private fireEditorChanged();
    private fireProjectChanged(projectPath);
    didProjectChanged(listener: any): void;
    didPathChanged(listener: any): void;
    getCurrentProjectPath(): string;
    getProjectSettings(projectPath: string): Promise<ProjectSettings>;
}
