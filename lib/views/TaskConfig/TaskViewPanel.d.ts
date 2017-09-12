import { UIBaseComponent } from '../../ui-components/UIComponent';
import { CordovaProjectInfo } from '../../cordova/Cordova';
import { CordovaTaskConfiguration } from '../../cordova/CordovaTasks';
export declare class TaskViewPanel extends UIBaseComponent {
    private threeViewPanel;
    private taskContentPanel;
    private project;
    constructor();
    initUI(): void;
    private createContentPanel();
    private createTreeViewPanel();
    setProject(project: CordovaProjectInfo): void;
    private update();
    private getTaskConfigurationByName(name);
    getConfiguration(): CordovaTaskConfiguration;
}
