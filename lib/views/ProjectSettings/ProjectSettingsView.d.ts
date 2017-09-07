export declare class ProjectSettingsView {
    private element;
    private item;
    private projectRoot;
    private projectId;
    private tabbedView;
    private atomTextEditor;
    private installedPluginsView;
    private installNewPluginsView;
    private variantsView;
    private appSignatureView;
    private generalSettingsView;
    constructor(projectRoot: string);
    private reloadProjectSettings();
    private initUI();
    createSimpleEmptyView(color: string): HTMLElement;
    /**
     * Open this view
     */
    open(): void;
    destroy(): void;
}
