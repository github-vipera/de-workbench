import { AbstractAppSignatureEditorCtrl, AppType } from './AbstractAppSignatureEditorCtrl';
export declare class AndroidAppSignatureEditorCtrl extends AbstractAppSignatureEditorCtrl {
    private keystorePath;
    private storePasswd;
    private alias;
    private passwd;
    constructor(appType: AppType);
    protected createControls(): Array<HTMLElement>;
    destroy(): void;
    updateUI(buildJson: any): void;
    saveChanges(): void;
    reload(): Promise<void>;
}
