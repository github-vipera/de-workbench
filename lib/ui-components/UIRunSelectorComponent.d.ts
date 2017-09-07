/// <reference types="node" />
import { EventEmitter } from 'events';
import { UIBaseComponent } from './UIComponent';
import { UISelect, UISelectItem, UISelectListener } from './UISelect';
import { UISelectButton } from './UISelectButton';
import { CordovaTaskConfiguration } from '../cordova/CordovaTasks';
export interface UITaskInfo {
    id: string;
    name: string;
}
export declare class UIRunSelectorComponent extends UIBaseComponent {
    projectSelector: UISelect;
    selectButton: UISelectButton;
    taskSelector: HTMLElement;
    taskSelectorText: Text;
    taskInfo: CordovaTaskConfiguration;
    events: EventEmitter;
    projectSelectListener: UISelectListener;
    constructor(events: EventEmitter);
    initUI(): void;
    addTaskSelectorButton(): void;
    subscribeEvents(): void;
    reloadProjectList(): void;
    getAllAvailableProjects(): Array<string>;
    createProjectSelector(projects: Array<string>): UISelect;
    createProjectSelectOptions(projects: Array<string>): Array<UISelectItem>;
    onTaskSelectClick(): void;
    onSelectProject(path: string): void;
    private updateTaskText(taskInfo);
    setTaskConfiguration(taskInfo: CordovaTaskConfiguration): void;
    getTaskConfiguration(): CordovaTaskConfiguration;
    destroy(): void;
}
