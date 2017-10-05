import { UIBaseComponent } from './UIComponent';
export interface UIMenuItem {
    displayName?: string;
    value: string;
    element?: HTMLElement;
}
export declare class UIButtonMenu extends UIBaseComponent {
    private items;
    private listView;
    private panel;
    private infoMessage;
    private emptyMessage;
    private onSelectListener;
    constructor();
    private initUI();
    setCaption(caption: string): UIButtonMenu;
    setMenuItems(items: Array<UIMenuItem>): UIButtonMenu;
    showMenu(): void;
    onItemSelected(item: UIMenuItem): void;
    dismissMenu(): Promise<void>;
    createMenuElement(item: UIMenuItem): HTMLElement;
    setInfoMessage(message: string): UIButtonMenu;
    setEmptyMessage(message: string): UIButtonMenu;
    setOnSelectionListener(listener: Function): UIButtonMenu;
}
