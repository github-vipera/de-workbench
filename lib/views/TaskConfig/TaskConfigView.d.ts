/// <reference types="node" />
import { UIModalView } from '../../ui-components/UIModalView';
import { UIButtonGroup } from '../../ui-components/UIButtonGroup';
import { TaskViewPanel } from './TaskViewPanel';
import { EventEmitter } from 'events';
import { CordovaProjectInfo } from '../../cordova/Cordova';
export declare class TaskConfigView extends UIModalView {
    taskPanel: TaskViewPanel;
    events: EventEmitter;
    actionButtons: UIButtonGroup;
    constructor(title: string, events: EventEmitter);
    addFooter(): void;
    private handleApply();
    private handleRun();
    close(): void;
    addContent(): void;
    setProject(project: CordovaProjectInfo): void;
    onTaskSelected(cfg: any): void;
}
