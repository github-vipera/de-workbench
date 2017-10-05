/// <reference types="node" />
import { EventEmitter } from 'events';
import { UIBaseComponent } from './UIComponent';
import { UISelect, UISelectItem } from './UISelect';
import { CordovaTaskConfiguration } from '../cordova/CordovaTasks';
export interface UITaskInfo {
    id: string;
    name: string;
}
export declare class UIRunSelectorComponent extends UIBaseComponent {
    private projectSelector;
    private selectButton;
    private taskSelect;
    private taskSelectButton;
    private taskInfo;
    private events;
    private projectSelectListener;
    private taskSelectListener;
    private taskHistory;
    constructor(events: EventEmitter);
    initUI(): void;
    addProjectSelector(): void;
    addTaskSelector(): void;
    subscribeEvents(): void;
    reloadProjectList(): void;
    getAllAvailableProjects(): Array<string>;
    createProjectSelector(projects: Array<string>): UISelect;
    createProjectSelectOptions(projects: Array<string>): Array<UISelectItem>;
    createTaskSelect(): UISelect;
    reloadTaskList(): void;
    createTaskSelectOptions(tasks: Array<CordovaTaskConfiguration>): Array<UISelectItem>;
    onCustomTaskSelectClick(): void;
    onSelectProject(path: string): void;
    private updateTaskText(taskInfo);
    setTaskConfiguration(taskInfo: CordovaTaskConfiguration): void;
    clearHistory(): void;
    private addTaskToHistory(taskInfo);
    getTaskConfiguration(): CordovaTaskConfiguration;
    setEnable(value: boolean): void;
    destroy(): void;
}
