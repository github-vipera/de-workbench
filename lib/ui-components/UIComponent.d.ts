export interface UIComponent {
    element(): HTMLElement;
}
export declare class UIBaseComponent implements UIComponent {
    protected mainElement: HTMLElement;
    protected uiComponentId: string;
    constructor();
    element(): HTMLElement;
    uiComponentID(): string;
    destroy(): void;
}
export declare class UIExtComponent extends UIBaseComponent {
    private _events;
    constructor();
    protected fireEvent(event: any, ...params: any[]): void;
    addEventListener(event: string, listener: any): void;
    removeEventListener(event: string, listener: any): void;
    destroy(): void;
}
