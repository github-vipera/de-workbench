export interface PaneViewOptions {
    id: string;
    title: string;
    location?: string;
    userData?: any;
    activatePane: boolean;
    searchAllPanes: boolean;
    getURI: Function;
    getTitle: Function;
}
export declare class UIPane {
    static readonly PANE_URI_PREFIX: string;
    private domEl;
    protected mainElement: HTMLElement;
    protected item: any;
    protected atomTextEditor: any;
    private _options;
    private _events;
    private _uri;
    private _el;
    private _title;
    constructor(uri: string, title?: string);
    init(options: PaneViewOptions): void;
    protected createUI(): HTMLElement;
    didOpen(): void;
    destroy(): void;
    setTitle(title: string): void;
    readonly paneId: string;
    readonly options: PaneViewOptions;
    static hashString(value: string): string;
    getTitle(): string;
    readonly element: HTMLElement;
    getURI(): string;
    protected fireEvent(event: any, ...params: any[]): void;
    protected getAtomPane(): any;
    protected updateTitleUI(title: string): void;
}
