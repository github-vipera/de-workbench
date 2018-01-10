import { UISelectItem } from '../../../ui-components/UISelect';
import { AbstractAppSignatureEditorCtrl, AppType } from './AbstractAppSignatureEditorCtrl';
export declare class IOSAppSignatureEditorCtrl extends AbstractAppSignatureEditorCtrl {
    private provisioningProfileSelect;
    private packageTypeSelect;
    private devTeamInput;
    private codeSignIdentityInput;
    private provisioningProfiles;
    constructor(appType: AppType);
    protected createControls(): Array<HTMLElement>;
    onItemSelected(value: any): void;
    private getProvisioningProfileByAppId(appId);
    protected getPackageTypeItems(): Array<UISelectItem>;
    destroy(): void;
    reloadProvisioningProfiles(provisioningProfiles: any): void;
    protected refreshProvisioningSelected(toSelect: string): void;
    protected createItems(provisioningProfiles: any): Array<UISelectItem>;
    updateUI(buildJson: any): void;
    saveChanges(): void;
    reload(): Promise<void>;
}
