import { UIBaseComponent } from './UIComponent';
export interface UISelectItem {
    name: string;
    value: string;
}
export interface UISelectListener {
    onItemSelected(value: string): any;
}
export declare class UISelect extends UIBaseComponent {
    private items;
    private listeners;
    constructor(items?: Array<UISelectItem>);
    updateUI(): void;
    onChange(evt: any): void;
    getItems(): UISelectItem[];
    setItems(items: Array<UISelectItem>): void;
    addSelectListener(listener: UISelectListener): void;
    removeSelectListener(listener: UISelectListener): void;
    createOptions(items: Array<UISelectItem>): HTMLElement[];
    setSelectedItem(value: string): void;
    getSelectedItem(): string;
}
