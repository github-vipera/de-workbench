import { UIBaseComponent } from '../ui-components/UIComponent';
export declare class UIInputFormElement extends UIBaseComponent {
    private label;
    private inputEditor;
    private listeners;
    constructor();
    private buildUI();
    setCaption(caption: string): UIInputFormElement;
    setValue(value: string): UIInputFormElement;
    getValue(): string;
    setWidth(width: string): UIInputFormElement;
    setPlaceholder(placeholder: string): UIInputFormElement;
    private getModel();
    addChangeListener(listener: any): UIInputFormElement;
}
