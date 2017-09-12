import { UIBaseComponent } from './UIComponent';
export declare enum UIIndicatorStatus {
    Idle = 0,
    Busy = 1,
    Success = 2,
    Error = 3,
}
export declare class UIStatusIndicatorComponent extends UIBaseComponent {
    private status;
    private textElement;
    private loadingElement;
    constructor(initialMsg?: string);
    private initUI(initialMsg);
    private createLoadingElement();
    private createTextElement(msg);
    private updateTextElementContent(msg, iconName?);
    private createMainElement();
    private updateInternalStatus(oldValue, newValue, message, iconName);
    private setOnLoading(value);
    setStatus(status: UIIndicatorStatus, message: string, iconName?: string): void;
    setText(message: string, iconName?: string): void;
}
