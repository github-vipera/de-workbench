import { ToolbarView } from './toolbar/ToolbarView';
import { NewProjectView } from './views/NewProjectView';
import { ProjectInspectorView } from './views/ProjectInspectorView';
import { DebugAreaView } from './views/DebugAreaView';
import { ProjectManager } from './DEWorkbench/ProjectManager';
export interface WorkbenchOptions {
    didToggleToolbar?: Function;
    didTogglePrjInspector?: Function;
    didToggleDebugArea?: Function;
}
export declare class DEWorkbench {
    toolbarView: ToolbarView;
    newProjectView: NewProjectView;
    projectInspectorView: ProjectInspectorView;
    debugAreaView: DebugAreaView;
    private events;
    projectManager: ProjectManager;
    constructor(options: WorkbenchOptions);
    onProjectChanged(projectPath: String): void;
    openProjectInspector(): void;
    openDebugArea(): void;
    toggleToolbar(): void;
    togglePrjInspector(): void;
    toggleDebugArea(): void;
    getToolbarElement(): HTMLElement;
    destroy(): void;
}
