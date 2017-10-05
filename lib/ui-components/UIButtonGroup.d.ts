import { UIBaseComponent } from './UIComponent';
export declare enum UIButtonGroupMode {
    Standard = 0,
    Toggle = 1,
    Radio = 2,
}
export declare class UIButtonConfig {
    id: string;
    caption: string;
    selected: boolean;
    buttonType: string;
    clickListener: Function;
    className: string;
    setId(id: string): UIButtonConfig;
    setCaption(caption: string): UIButtonConfig;
    setSelected(selected: boolean): UIButtonConfig;
    setButtonType(buttonType: string): UIButtonConfig;
    setClassName(className: string): UIButtonConfig;
    setClickListener(clickListener: Function): UIButtonConfig;
}
export declare class UIButtonGroup extends UIBaseComponent {
    private buttonGroup;
    private toggleMode;
    private buttons;
    private listeners;
    private changeListeners;
    constructor(toggleMode: UIButtonGroupMode);
    private buildUI();
    addButton(buttonConfig: UIButtonConfig): UIButtonGroup;
    toggleButton(id: string): void;
    selectButton(id: string, select: boolean): void;
    private createButton(buttonConfig);
    addChangeListener(listener: Function): UIButtonGroup;
    getSelectedButtons(): Array<string>;
    destroy(): void;
}
