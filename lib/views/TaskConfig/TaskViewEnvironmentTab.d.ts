import { UIBaseComponent } from '../../ui-components/UIComponent';
import { CordovaTaskConfiguration } from '../../cordova/CordovaTasks';
import { CordovaProjectInfo } from '../../cordova/Cordova';
export declare class TaskViewEnvironmentTab extends UIBaseComponent {
    private environmentVarRenderer;
    private cliParamsRenderer;
    constructor();
    initUI(): void;
    contextualize(task: CordovaTaskConfiguration, project: CordovaProjectInfo): void;
}
