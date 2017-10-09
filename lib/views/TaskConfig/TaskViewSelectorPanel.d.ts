/// <reference types="node" />
import { UIBaseComponent } from '../../ui-components/UIComponent';
import { CordovaTaskConfiguration } from '../../cordova/CordovaTasks';
import { UITreeItem, UITreeViewSelectListener } from '../../ui-components/UITreeView';
import { EventEmitter } from 'events';
export declare class TaskViewSelectorPanel extends UIBaseComponent implements UITreeViewSelectListener {
    private treeModel;
    private treeView;
    private taskSelectionListener;
    private cdvTasks;
    private evtEmitter;
    constructor(evtEmitter: EventEmitter);
    buildTreeModel(cvdTasks: Array<CordovaTaskConfiguration>): void;
    initUI(): void;
    private createButtonToolbar();
    buildAndAddTreeView(cdvTasks: Array<CordovaTaskConfiguration>): void;
    createCustomTaskNode(cvdCustomTasks: Array<CordovaTaskConfiguration>): UITreeItem;
    createCdvTaskNode(cvdTask: Array<CordovaTaskConfiguration>): UITreeItem;
    onItemSelected(itemId: string, item: UITreeItem): void;
    setSelected(itemId: string, value: boolean): void;
    setOnTaskChangeListener(callback: (itemId: string) => void): void;
    translateItemIdToTaskId(itemId: string): string;
}
