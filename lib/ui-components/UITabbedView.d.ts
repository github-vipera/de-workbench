import { UIBaseComponent } from './UIComponent';
export declare class UITabbedViewItem {
    id: string;
    private title;
    titleClassName: string;
    view: HTMLElement;
    readonly elementUID: string;
    private events;
    constructor(id: string, title: string, view: HTMLElement);
    setTitleClass(className: string): UITabbedViewItem;
    setTitle(title: string): UITabbedViewItem;
    didTabSelected(): void;
    getTitle(): string;
    protected fireTabSelected(): void;
    protected fireTitleChanged(): void;
    addEventListener(event: string, listener: any): UITabbedViewItem;
    removeEventListener(event: string, listener: any): void;
    destroy(): void;
}
export declare enum UITabbedViewTabType {
    Vertical = 0,
    Horizontal = 1,
}
export declare class UITabbedView extends UIBaseComponent {
    private tabList;
    private stacked;
    private views;
    private tabType;
    private selectedTab;
    static readonly CLSNAME_TAB_TYPE_VERTICAL: string;
    static readonly CLSNAME_TAB_TYPE_HORIZONTAL: string;
    static readonly CLSNAME_TAB_TYPE_DEFAULT: string;
    constructor();
    protected buildUI(): void;
    getSelectedTab(): UITabbedViewItem;
    setTabType(tabType: UITabbedViewTabType): UITabbedView;
    protected createTabList(): HTMLElement;
    protected createStackContainer(): HTMLElement;
    addView(tabItem: UITabbedViewItem): void;
    removeViewByTitle(tabTitle: string): void;
    removeViewById(tabId: string): void;
    getTabItemByTitle(tabTitle: string): UITabbedViewItem;
    getTabItemById(tabId: string): UITabbedViewItem;
    removeView(tabItem: UITabbedViewItem): void;
    removeAllTabs(): void;
    getAllIds(): Array<string>;
    setBottomToolbar(toolbarElement: HTMLElement): this;
    destroy(): void;
}
