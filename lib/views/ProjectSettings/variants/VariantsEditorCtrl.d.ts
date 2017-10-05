import { UIBaseComponent } from '../../../ui-components/UIComponent';
import { UITabbedViewItem } from '../../../ui-components/UITabbedView';
import { Variant } from '../../../DEWorkbench/VariantsManager';
export declare class VariantsEditorCtrl extends UIBaseComponent {
    private projectRoot;
    private tabbedView;
    private events;
    private variantsManager;
    private variantsModel;
    private modalPrompt;
    constructor(projectRoot: string);
    protected initUI(): void;
    reload(): void;
    private updateUI();
    addEventListener(event: string, listener: any): void;
    removeEventListener(event: string, listener: any): void;
    promtpForNewVariant(): void;
    promtpForRenameVariant(): void;
    promtpForCloneVariant(): void;
    promtpForRemoveVariant(): void;
    cloneVariant(variantToCloneName: string, newVariantName: string): void;
    renameVariant(variantName: string, newVariantName: string): void;
    addNewVariant(variantName: string): void;
    removeVariant(variantName: string): void;
    protected createVariantView(variant: Variant): UITabbedViewItem;
    protected saveVariantsChanges(): void;
    protected fireDataChanged(): void;
    destroy(): void;
}
