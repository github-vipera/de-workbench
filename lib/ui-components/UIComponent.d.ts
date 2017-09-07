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
