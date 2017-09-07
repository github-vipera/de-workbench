/// <reference types="node" />
import { UIModalView } from '../../ui-components/UIModalView';
import { TaskViewPanel } from './TaskViewPanel';
import { EventEmitter } from 'events';
import { CordovaProjectInfo } from '../../cordova/Cordova';
export declare class TaskConfigView extends UIModalView {
    taskPanel: TaskViewPanel;
    events: EventEmitter;
    constructor(title: string, events: EventEmitter);
    addFooter(): void;
    close(): void;
    addContent(): void;
    setProject(project: CordovaProjectInfo): void;
}
