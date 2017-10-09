import { UIListView, UIListViewModel } from './UIListView';
export interface UIExtendedListViewValidationResult {
    validationStatus: boolean;
    validationErrorMessage: string;
    showValidationError: boolean;
}
export interface UIExtendedListViewModel extends UIListViewModel {
    isCellEditable(row: number, col: number): boolean;
    onValueChanged(row: number, col: number, value: any): any;
    onEditValidation(row: number, col: number, value: any): UIExtendedListViewValidationResult;
}
export declare class UIExtendedListView extends UIListView {
    private selectedCell;
    private selectedRow;
    private extendedModel;
    private editorEl;
    private editing;
    private cellSelectable;
    private validationErrorOverlay;
    constructor(model: UIExtendedListViewModel);
    protected buildUI(): void;
    protected createEditor(): HTMLElement;
    protected createValidationErrorOverlay(): HTMLElement;
    protected tableReady(table: HTMLElement): void;
    protected navigateTableWithKeyboard(key: number): void;
    protected navigateRight(): void;
    protected navigateLeft(): void;
    protected navigateDown(): void;
    protected navigateUp(): void;
    protected removeCurrentSelection(): void;
    protected selectCell(cell: HTMLElement): void;
    protected selectRow(row: any): void;
    getSelectedRow(): number;
    getSelectedColumn(): number;
    protected manageCellEdit(cell: HTMLElement): void;
    protected startEditing(row: number, col: number, cell: HTMLElement): void;
    protected prepareEditor(row: number, col: number, cell: HTMLElement): HTMLElement;
    protected moveEditor(cell: HTMLElement): void;
    protected commitEditing(): boolean;
    protected cancelEditing(): void;
    isEditing(): boolean;
    protected showValidationError(errorMessage: string): void;
    protected hideValidationError(): void;
    isCellSelectable(): boolean;
    setCellSelectable(value: boolean): UIExtendedListView;
}
