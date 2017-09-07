export declare class DebugAreaView {
    private element;
    private events;
    private panel;
    private txtProjectName;
    private txtPackageID;
    private txtDestinationPath;
    private editorElement;
    private item;
    private atomWorkspace;
    constructor();
    open(): void;
    close(): void;
    createControlText(pluginName: string, key: string, config: any): any;
}
