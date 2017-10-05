import { UIBaseComponent } from '../../ui-components/UIComponent';
import { CordovaProjectInfo } from '../../cordova/Cordova';
import { CordovaTaskConfiguration } from '../../cordova/CordovaTasks';
export declare class TaskViewPanel extends UIBaseComponent {
    private threeViewPanel;
    private taskContentPanel;
    private project;
    private evtEmitter;
    private lastSelected;
    private tasks;
    constructor();
    initUI(): void;
    private createContentPanel();
    private createTreeViewPanel();
    setProject(project: CordovaProjectInfo): void;
    loadTasks(): void;
    private update();
    private getTaskConfigurationByName(name);
    private cloneAndAddNewTasks(lastSelected);
    private removeTask(task);
    getConfiguration(): CordovaTaskConfiguration;
    private applyConfigToModel(config);
    saveAllConfiguration(): void;
}
