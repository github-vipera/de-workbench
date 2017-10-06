/// <reference types="node" />
import { UIBaseComponent } from '../../../ui-components/UIComponent';
import { UITreeViewModel, UITreeView, UITreeItem } from '../../../ui-components/UITreeView';
import { EventEmitter } from 'events';
import { Variant } from '../../../DEWorkbench/VariantsManager';
export declare class VariantsGridCtrl extends UIBaseComponent {
    protected treeModel: VariantTreeModel;
    protected treeView: UITreeView;
    protected events: EventEmitter;
    protected variant: Variant;
    constructor(variant: Variant);
    protected initUI(): void;
    protected createTreeModel(): VariantTreeModel;
    addEventListener(event: string, listener: any): VariantsGridCtrl;
    removeEventListener(event: string, listener: any): VariantsGridCtrl;
    destroy(): void;
}
export declare class VariantTreeModel implements UITreeViewModel {
    root: VariantsTreeItem;
    events: EventEmitter;
    className?: string;
    protected variant: Variant;
    constructor(variant: Variant);
    setRoot(root: VariantsTreeItem): VariantTreeModel;
    protected subscribeForItemEvents(treeItem: VariantsTreeItem): void;
    getItemById(id: string): VariantsTreeItem;
    addEventListener(event: string, listener: any): void;
    removeEventListener(event: string, listener: any): void;
    protected fireModelChanged(): void;
    destroy(): void;
}
export declare class VariantsTreeItem implements UITreeItem {
    id: string;
    name: string;
    children: Array<VariantsTreeItem>;
    htmlElement: HTMLElement;
    expanded: boolean;
    protected events: EventEmitter;
    protected variant: Variant;
    constructor(id: string, name: string, variant: Variant);
    setChildren(children: Array<VariantsTreeItem>): VariantsTreeItem;
    protected fireItemChanged(): void;
    addEventListener(event: string, listener: any): void;
    removeEventListener(event: string, listener: any): void;
    destroy(): void;
}
export declare class VariantsPlatformTreeItem extends VariantsTreeItem {
    private propertyRenderer;
    private platformName;
    constructor(platformName: string, displayName: string, variant: Variant);
    protected createChildrenForProperties(): void;
    destroy(): void;
}
