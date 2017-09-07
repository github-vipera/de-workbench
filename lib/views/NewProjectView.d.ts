export declare class NewProjectView {
    private element;
    private events;
    private panel;
    private txtProjectName;
    private txtPackageID;
    private txtDestinationPath;
    private editorElement;
    constructor();
    open(activePlugin?: Plugin): void;
    close(): void;
    createControlText(pluginName: string, key: string, config: any): any;
}
