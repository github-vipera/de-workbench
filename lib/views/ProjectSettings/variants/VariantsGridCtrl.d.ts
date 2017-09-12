import { UIBaseComponent } from '../../../ui-components/UIComponent';
import { UITreeViewModel, UITreeView, UITreeItem } from '../../../ui-components/UITreeView';
export declare class VariantsGridCtrl extends UIBaseComponent {
    protected treeModel: VariantsTreeModel;
    protected treeView: UITreeView;
    constructor();
    protected initUI(): void;
    protected createTreeModel(): VariantsTreeModel;
}
export declare class VariantsTreeModel implements UITreeViewModel {
    root: VariantsTreeItem;
    className?: string;
    constructor();
    setRoot(root: VariantsTreeItem): VariantsTreeModel;
    getItemById?(id: string, model: UITreeViewModel): VariantsTreeItem;
}
export declare class VariantsTreeItem implements UITreeItem {
    id: string;
    name: string;
    children: Array<VariantsTreeItem>;
    htmlElement: HTMLElement;
    constructor(id: string, name: string);
    setChildren(children: Array<VariantsTreeItem>): VariantsTreeItem;
}
export declare class VariantsPlatformTreeItem extends VariantsTreeItem {
    protected properties: Array<any>;
    private propertyRenderer;
    constructor(platformName: string, displayName: string, properties: Array<any>);
    protected createChildrenForProperties(): void;
}
export declare class VariantProperty {
    name: string;
    value: any;
}
