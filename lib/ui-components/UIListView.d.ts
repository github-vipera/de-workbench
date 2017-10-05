import { UIBaseComponent } from './UIComponent';
export interface UIListViewModel {
    hasHeader(): boolean;
    getRowCount(): number;
    getColCount(): number;
    getElementAt?(row: number, col: number): HTMLElement;
    getValueAt(row: number, col: number): any;
    getClassNameAt?(row: number, col: number): string;
    getColumnName(col: number): string;
    getClassName(): string;
    addEventListener(event: string, listener: any): any;
    removeEventListener(event: string, listener: any): any;
    destroy(): any;
    getTitleAt?(row: number, col: number): any;
}
export declare class UIListView extends UIBaseComponent {
    protected model: UIListViewModel;
    protected tableElement: HTMLElement;
    protected subscriptions: any;
    constructor(model: UIListViewModel);
    setModel(model: UIListViewModel): void;
    protected buildUI(): void;
    protected tableReady(table: HTMLElement): void;
    protected createTableElement(): HTMLElement;
    protected modelChanged(): void;
    destroy(): void;
}
