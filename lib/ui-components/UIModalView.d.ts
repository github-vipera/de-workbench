import { Panel } from 'atom';
export interface UIModalWindow {
    hide(): void;
    show(): void;
    isVisible(): boolean;
}
export declare class UIModalView implements UIModalWindow {
    protected modalContainer: HTMLElement;
    protected panel: Panel;
    protected title: string;
    protected element: HTMLElement;
    constructor(title: string);
    initModalBaseUI(): void;
    show(): void;
    hide(): void;
    isVisible(): boolean;
    destroy(): void;
    destroyModalContainer(): void;
    protected addHeader(): void;
    protected addContent(): void;
    protected addFooter(): void;
}
