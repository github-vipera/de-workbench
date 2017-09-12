import { UIBaseComponent } from './UIComponent';
import { UIListView } from './UIListView';
import { CordovaPlugin } from '../cordova/Cordova';
export interface DisplayConfiguration {
    ratingVisible: boolean;
    lastUpdateVisible: boolean;
    platformsVisible: boolean;
    authorVisible: boolean;
}
export declare class UIPluginsList extends UIListView {
    private pluginListModel;
    private callbackFunc;
    private displayConfiguration;
    constructor();
    private initModel();
    clearList(): void;
    addPlugin(pluginInfo: CordovaPlugin): void;
    addPlugins(plugins: Array<CordovaPlugin>): void;
    setPlugins(plugins: Array<CordovaPlugin>): void;
    setEventListener(callbackFunc: Function): UIPluginsList;
    setPluginInstallPending(pluginInfo: CordovaPlugin, installing: boolean): void;
    setPluginUInstallPending(pluginInfo: CordovaPlugin, unistalling: boolean): void;
    setRatingVisible(visible: boolean): UIPluginsList;
    setLastUpdateVisible(visible: boolean): UIPluginsList;
    setPlatformsVisible(visible: boolean): UIPluginsList;
    private updateUI();
}
export declare class UIPluginItem extends UIBaseComponent {
    readonly pluginInfo: CordovaPlugin;
    private statsEl;
    private callbackFunc;
    private metSection;
    private bodySection;
    private statsSection;
    private displayConfiguration;
    constructor(pluginInfo: CordovaPlugin, displayConfiguration: DisplayConfiguration);
    private buildUI();
    updateUI(displayConfiguration: DisplayConfiguration): void;
    setEventListener(callbackFunc: Function): UIPluginItem;
    setPluginInstallPending(installing: boolean): void;
    setPluginUInstallPending(unistalling: boolean): void;
}
export declare class UIPluginSection extends UIBaseComponent {
    protected pluginInfo: CordovaPlugin;
    protected displayConfiguration: DisplayConfiguration;
    constructor(pluginInfo: CordovaPlugin, displayConfiguration: DisplayConfiguration);
    protected buildUI(): void;
    updateUI(displayConfiguration: DisplayConfiguration): void;
    setPluginInstallPending(installing: boolean): void;
    setPluginUInstallPending(unistalling: boolean): void;
    protected changeElementVisibility(element: HTMLElement, visible: boolean): void;
}
export declare class UIPluginStatsSection extends UIPluginSection {
    constructor(pluginInfo: CordovaPlugin, displayConfiguration: DisplayConfiguration);
    protected buildUI(): void;
    updateUI(displayConfiguration: DisplayConfiguration): void;
}
export declare class UIPluginBodySection extends UIPluginSection {
    private pluginUpdateDateEl;
    constructor(pluginInfo: CordovaPlugin, displayConfiguration: DisplayConfiguration);
    protected buildUI(): void;
    updateUI(displayConfiguration: DisplayConfiguration): void;
}
export declare class UIPluginMetaSection extends UIPluginSection {
    protected callbackFunc: Function;
    protected metaButtons: UIPluginMetaButtons;
    protected ratingEl: HTMLElement;
    protected platformsEl: HTMLElement;
    constructor(pluginInfo: CordovaPlugin, displayConfiguration: DisplayConfiguration);
    protected buildUI(): void;
    setEventListener(callbackFunc: Function): UIPluginMetaSection;
    private renderPlatforms(platforms);
    setPluginInstallPending(installing: boolean): void;
    setPluginUInstallPending(installing: boolean): void;
    updateUI(displayConfiguration: DisplayConfiguration): void;
}
export declare class UIPluginMetaButtons extends UIPluginSection {
    static readonly BTN_TYPE_INSTALL: number;
    static readonly BTN_TYPE_UNINSTALL: number;
    private btnInstall;
    private btnUninstall;
    private callbackFunc;
    private spinner;
    constructor(pluginInfo: CordovaPlugin, displayConfiguration: DisplayConfiguration);
    setEventListener(callbackFunc: Function): void;
    protected buildUI(): void;
    private buildButton(caption);
    showButtons(buttonType: number): UIPluginMetaButtons;
    setButtonEnabled(buttonType: number, enabled: boolean): UIPluginMetaButtons;
    setPluginInstallPending(installing: boolean): void;
    setPluginUInstallPending(unistalling: boolean): void;
    updateUI(displayConfiguration: DisplayConfiguration): void;
}
