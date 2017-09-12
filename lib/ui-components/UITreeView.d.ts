import { UIBaseComponent } from './UIComponent';
export interface UITreeItem {
    id: string;
    name: string;
    className?: string;
    icon?: string;
    expanded?: boolean;
    htmlElement?: HTMLElement;
    children?: Array<UITreeItem>;
    selected?: boolean;
}
export interface UITreeViewModel {
    root: UITreeItem;
    className?: string;
    getItemById?(id: string, model: UITreeViewModel): UITreeItem;
}
export interface UITreeViewSelectListener {
    onItemSelected(itemId: string, item?: UITreeItem): void;
}
export declare class UITreeView extends UIBaseComponent {
    private model;
    private treeElement;
    private currentSelection;
    private listeners;
    constructor(model?: UITreeViewModel);
    private initUI();
    setModel(model: UITreeViewModel): void;
    modelChanged(): void;
    private rebuildTree();
    private buildTreeItem(item);
    addSelectListener(listener: UITreeViewSelectListener): void;
    removeSelectListener(listener: UITreeViewSelectListener): void;
    protected onItemClicked(evt: any): void;
    protected fireSelectionChange(itemId: string): void;
    getCurrentSelectedItemId(): string;
    selectItemById(id: string, select: boolean): void;
    buildItemElementId(id: string): string;
    expandItemById(id: string): void;
    collapseItemById(id: string): void;
    toggleTreeItemExpansion(id: string): void;
    getTreeItemById(id: string): Element;
    destroy(): void;
}
export declare function findItemInTreeModel(itemId: string, model: UITreeViewModel): any;
