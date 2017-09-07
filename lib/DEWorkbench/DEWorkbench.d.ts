import { ToolbarView } from '../toolbar/ToolbarView';
import { DebugAreaView } from '../views/DebugAreaView';
import { ProjectManager } from '../DEWorkbench/ProjectManager';
import { LoggerView } from '../views/LoggerView';
import { CordovaProjectInfo } from '../cordova/Cordova';
import { CordovaTaskConfiguration } from '../cordova/CordovaTasks';
import { TaskExecutor } from '../tasks/TaskExecutor';
export interface WorkbenchOptions {
    didToggleToolbar?: Function;
    didToggleDebugArea?: Function;
    didProjectSettings?: Function;
    didToggleConsole?: Function;
}
export declare class DEWorkbench {
    toolbarView: ToolbarView;
    debugAreaView: DebugAreaView;
    loggerView: LoggerView;
    private events;
    projectManager: ProjectManager;
    selectedProjectForTask: CordovaProjectInfo;
    private taskExecutor;
    private taskConfiguration;
    constructor(options: WorkbenchOptions);
    showNewProjectModal(): void;
    onProjectChanged(projectPath: String): void;
    openProjectInspector(): void;
    openDebugArea(): void;
    openLogger(): void;
    showProjectSettings(): void;
    toggleToolbar(): void;
    toggleDebugArea(): void;
    toggleLogger(): void;
    getToolbarElement(): HTMLElement;
    showCordovaTaskModal(): void;
    onTaskRunRequired(taskConfiguration: CordovaTaskConfiguration): void;
    onStopTask(): void;
    getTaskExecutor(): TaskExecutor;
    destroy(): void;
}
