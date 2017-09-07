import { UIBaseComponent } from '../../ui-components/UIComponent';
export declare class AppInfoView extends UIBaseComponent {
    private mainFormElement;
    private nameCtrl;
    private descriptionCtrl;
    private displayName;
    private authorCtrl;
    private licenseCtrl;
    private versionCtrl;
    private currentProjectPath;
    private actionButtons;
    constructor();
    private buildUI();
    private reload();
    private saveChanges();
    private onTextValueChanged(sourceCtrl);
}
