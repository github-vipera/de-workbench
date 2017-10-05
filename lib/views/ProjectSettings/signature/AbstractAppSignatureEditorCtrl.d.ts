import { UIBaseComponent } from '../../../ui-components/UIComponent';
export declare enum AppType {
    Debug = 1,
    Release = 2,
}
export declare class AbstractAppSignatureEditorCtrl extends UIBaseComponent {
    protected appType: AppType;
    protected buildJson: any;
    constructor(appType: AppType);
    protected initUI(): void;
    getApptype(): AppType;
    protected createBlock(title: string, element: HTMLElement): HTMLElement;
    destroy(): void;
    protected createControls(): Array<HTMLElement>;
    reload(): void;
    saveChanges(): void;
    setBuildJson(buildJson: any): void;
    updateUI(buildJson: any): void;
    protected getBuildJsonsection(platform: string): any;
}
