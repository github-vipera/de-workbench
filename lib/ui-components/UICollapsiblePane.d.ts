import { UIBaseComponent } from '../ui-components/UIComponent';
export interface UICollapsiblePaneItem {
    id: string;
    view: HTMLElement;
    caption: string;
    subtle?: string;
    collapsed?: boolean;
}
export declare class UICollapsiblePane extends UIBaseComponent {
    protected listTreeEl: HTMLElement;
    private items;
    constructor();
    protected initUI(): void;
    addItem(item: UICollapsiblePaneItem): UICollapsiblePane;
    destroy(): void;
}
