import { UIIndicatorStatus } from '../ui-components/UIStatusIndicatorComponent';
export interface ToolbarOptions {
    didNewProject?: Function;
    didRun?: Function;
    didStop?: Function;
    didBuild?: Function;
    didReload?: Function;
    didOpenJSConsole?: Function;
    didProjectSettings?: Function;
    didToggleToolbar?: Function;
    didToggleDebugArea?: Function;
    didSelectProjectForRun?: Function;
    didToggleConsole?: Function;
    didSelectTaskClick?: Function;
    didTaskSelected?: Function;
}
export interface ToolbarStatus {
    btnRunEnable?: boolean;
    btnStopEnable?: boolean;
    btnReloadEnable?: boolean;
    btnOpenJSConsoleEnable?: boolean;
    prjSelectorEnable?: boolean;
    progressStatus?: UIIndicatorStatus;
    progressMsg?: string;
    progressIcon?: string;
}
export declare class ToolbarView {
    private element;
    private events;
    private subscriptions;
    private newProjectButton;
    private runButton;
    private stopButton;
    private logoElement;
    private buildButton;
    private runSelector;
    private statusIndicator;
    private reloadButton;
    private openJSConsoleButton;
    private toolbarElement;
    private toolbarAnchor;
    private isVisible;
    constructor(options: ToolbarOptions);
    private toggleAtomTitleBar(value);
    private createRunComponents();
    private createStatusIndicator();
    toggle(): void;
    private createToogleButtons();
    displayAsTitleBar(): void;
    displayDefault(): void;
    setTaskConfiguration(configuration: any): void;
    destroy(): void;
    getElement(): HTMLElement;
    setInProgressStatus(msg: string, iconName?: string): void;
    setSuccessStatus(msg: string, iconName?: string): void;
    setIdleStatus(msg: string, iconName?: string): void;
    setErrorStatus(msg: string, iconName?: string): void;
    updateStatus(status: ToolbarStatus): void;
    private updateButtonStatus(element, enabled);
}
