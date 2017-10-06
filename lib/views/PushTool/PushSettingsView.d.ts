import { UIBaseComponent } from '../../ui-components/UIComponent';
import { UIInputFormElement, UIInputBrowseForFileFormElement } from '../../ui-components/UIInputFormElement';
export declare class PushSettingsView extends UIBaseComponent {
    projectRoot: string;
    private stackedPage;
    iosPemCertPathCrtl: UIInputBrowseForFileFormElement;
    iosPemKeyPathCrtl: UIInputBrowseForFileFormElement;
    iosPassphraseCrtl: UIInputFormElement;
    gcmApiKeyCrtl: UIInputFormElement;
    constructor(projectRoot: string);
    protected initUI(): void;
    protected createForm(): any;
    protected createFormElements(): Array<HTMLElement>;
    protected reloadConfig(): Promise<void>;
    protected revertConfig(): void;
    protected saveConfig(): Promise<void>;
}
