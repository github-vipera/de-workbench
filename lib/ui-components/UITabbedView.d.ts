import { UIBaseComponent } from './UIComponent';
export declare class UITabbedViewItem {
    id: string;
    title: string;
    titleClassName: string;
    view: HTMLElement;
    readonly elementUID: string;
    constructor(id: string, title: string, view: HTMLElement);
    setTitleClass(className: string): UITabbedViewItem;
}
export declare enum UITabbedViewTabType {
    Vertical = 0,
    Horizontal = 1,
}
/**
 * Tabbed View main component
 */
export declare class UITabbedView extends UIBaseComponent {
    private tabList;
    private stacked;
    private views;
    private tabType;
    static readonly CLSNAME_TAB_TYPE_VERTICAL: string;
    static readonly CLSNAME_TAB_TYPE_HORIZONTAL: string;
    static readonly CLSNAME_TAB_TYPE_DEFAULT: string;
    constructor();
    protected buildUI(): void;
    setTabType(tabType: UITabbedViewTabType): UITabbedView;
    protected createTabList(): HTMLElement;
    protected createStackContainer(): HTMLElement;
    addView(tabItem: UITabbedViewItem): void;
    removeView(tabItem: UITabbedViewItem): void;
    setBottomToolbar(toolbarElement: HTMLElement): this;
    destroy(): void;
}
