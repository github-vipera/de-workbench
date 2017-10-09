/// <reference types="node" />
import { EventEmitter } from 'events';
import { UIBaseComponent } from '../ui-components/UIComponent';
import { UISelect, UISelectItem } from '../ui-components/UISelect';
export declare enum FormType {
    Standard = 1,
    FlexForm = 2,
}
export interface UIInputFormElementOptions {
    password?: boolean;
    autoSelect?: boolean;
    caption?: string;
    formType?: FormType;
    placeholder?: string;
}
export declare class UIInputFormElement extends UIBaseComponent {
    protected events: EventEmitter;
    private label;
    private inputEditor;
    private listeners;
    private lastValue;
    private options;
    private chainToEl;
    constructor(options?: UIInputFormElementOptions);
    protected defaultOptions(): UIInputFormElementOptions;
    protected buildUI(): void;
    getLabel(): HTMLElement;
    protected createControlContainer(label: HTMLElement, inputEditor: HTMLElement): HTMLElement;
    protected createControlContainerStd(label: HTMLElement, inputEditor: HTMLElement): HTMLElement;
    protected createControlContainerFlex(label: HTMLElement, inputEditor: HTMLElement): HTMLElement;
    protected createInputEditor(): HTMLElement;
    chainTo(nextElement: HTMLElement): UIInputFormElement;
    toChain(): HTMLElement;
    setCaption(caption: string): UIInputFormElement;
    setValue(value: string): UIInputFormElement;
    getValue(): string;
    setWidth(width: string): UIInputFormElement;
    setPlaceholder(placeholder: string): UIInputFormElement;
    addEventListener(event: string, listener: any): UIInputFormElement;
    protected fireEvent(event: string): void;
    protected selectAll(): void;
    destroy(): void;
}
export declare class UISelectFormElement extends UIInputFormElement {
    selectCtrl: UISelect;
    constructor();
    protected createInputEditor(): HTMLElement;
    setCaption(caption: string): UISelectFormElement;
    getSelectCtrl(): UISelect;
    setItems(items: Array<UISelectItem>): void;
    setValue(value: string): UIInputFormElement;
    getValue(): string;
    chainTo(nextElement: HTMLElement): UIInputFormElement;
}
export declare class UIInputWithButtonFormElement extends UIInputFormElement {
    protected buttonEl: HTMLElement;
    constructor(options?: UIInputFormElementOptions);
    protected createControlContainerFlex(label: HTMLElement, inputEditor: HTMLElement): HTMLElement;
    protected createControlContainerStd(label: HTMLElement, inputEditor: HTMLElement): HTMLElement;
    private createButton(caption);
    setButtonCaption(caption: string): UIInputWithButtonFormElement;
    setCaption(caption: string): UIInputWithButtonFormElement;
    setPlaceholder(placeholder: string): UIInputWithButtonFormElement;
    addEventListener(event: string, listener: any): UIInputWithButtonFormElement;
    chainTo(nextElement: HTMLElement): UIInputWithButtonFormElement;
}
export declare class UIInputBrowseForFolderFormElement extends UIInputWithButtonFormElement {
    constructor(options?: UIInputFormElementOptions);
    protected prepareForEvents(): void;
    protected chooseFolder(): void;
    setCaption(caption: string): UIInputBrowseForFolderFormElement;
    setPlaceholder(placeholder: string): UIInputBrowseForFolderFormElement;
    addEventListener(event: string, listener: any): UIInputBrowseForFolderFormElement;
    chainTo(nextElement: HTMLElement): UIInputBrowseForFolderFormElement;
}
export declare class UIInputBrowseForFileFormElement extends UIInputBrowseForFolderFormElement {
    constructor(options?: UIInputFormElementOptions);
    protected chooseFolder(): void;
}
