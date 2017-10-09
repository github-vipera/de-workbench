import { UIBaseComponent } from './UIComponent';
export interface UITreeItemAttribute {
    name: string;
    value: string;
}
export interface UITreeItem {
    id: string;
    name: string;
    className?: string;
    icon?: string;
    expanded?: boolean;
    htmlElement?: HTMLElement;
    children?: Array<UITreeItem>;
    selected?: boolean;
    attributes?: Array<UITreeItemAttribute>;
}
export interface UITreeViewModel {
    root: UITreeItem;
    className?: string;
    getItemById(id: string): UITreeItem;
    addEventListener(event: string, listener: any): any;
    removeEventListener(event: string, listener: any): any;
    destroy(): any;
}
export interface UITreeViewSelectListener {
    onItemSelected(itemId: string, item?: UITreeItem): void;
}
export declare class UITreeView extends UIBaseComponent {
    private model;
    private treeElement;
    private currentSelection;
    private events;
    constructor(model?: UITreeViewModel);
    private initUI();
    setModel(model: UITreeViewModel): void;
    protected onModelChanged(): void;
    private rebuildTree();
    private buildTreeItem(item);
    addEventListener(event: string, listener: any): void;
    removeEventListener(event: string, listener: any): void;
    protected onItemDblClicked(evt: any): void;
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
