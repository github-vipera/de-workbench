import { UIExtComponent } from '../ui-components/UIComponent';
export interface UIEditableLabelOptions {
    caption?: string;
    className?: string;
    editable?: boolean;
}
export declare class UIEditableLabel extends UIExtComponent {
    _options: UIEditableLabelOptions;
    _labelContainer: HTMLElement;
    _labelEl: HTMLElement;
    _editable: boolean;
    _editorEl: HTMLElement;
    _isEditing: boolean;
    constructor(options?: UIEditableLabelOptions);
    protected initUI(): void;
    setCaption(caption: string): UIEditableLabel;
    protected onLabelDoubleClick(evt: any): void;
    startEdit(): void;
    protected createEditor(): HTMLElement;
    protected commitEditing(): boolean;
    protected cancelEditing(): void;
    protected startEditing(cell: HTMLElement): void;
    protected prepareEditor(cell: HTMLElement): HTMLElement;
    isEditing(): boolean;
    protected moveEditor(cell: HTMLElement): void;
    getCaption(): string;
}
