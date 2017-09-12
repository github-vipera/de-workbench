import { UIBaseComponent } from './UIComponent';
export declare class UIToolbarButton {
    id: string;
    caption: string;
    title: string;
    handler: Function;
    className: string;
    icon: string;
    isToggle: boolean;
    checked: boolean;
    withSpace: boolean;
    setId(id: string): UIToolbarButton;
    setCaption(caption: string): UIToolbarButton;
    setTitle(title: string): UIToolbarButton;
    setClassName(className: string): UIToolbarButton;
    setHandler(handler: Function): UIToolbarButton;
    setIcon(icon: string): UIToolbarButton;
    setToggle(toggle: boolean): UIToolbarButton;
    setChecked(checked: boolean): UIToolbarButton;
    setWithSpace(withSpace: boolean): UIToolbarButton;
}
export declare class UIToolbar extends UIBaseComponent {
    private floatRightButtons;
    private subscriptions;
    constructor();
    private initUI();
    addElementNoSpace(element: HTMLElement): UIToolbar;
    addElement(element: HTMLElement): UIToolbar;
    addRightElement(element: HTMLElement): UIToolbar;
    addButton(button: UIToolbarButton): UIToolbar;
    addRightButton(button: UIToolbarButton): UIToolbar;
    protected createButton(button: UIToolbarButton): HTMLElement;
    protected createToggleButton(button: UIToolbarButton): HTMLElement;
}
