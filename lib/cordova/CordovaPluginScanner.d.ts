export declare class CordovaPluginScanner {
    private pluginIds;
    private path;
    private pluginsPath;
    private fetchJson;
    private completionCallback;
    private scanningPlugins;
    constructor();
    scan(projectRootPath: string, callbackFunc: any): boolean;
    scanPlugin(pluginId: any, path: any): void;
    getInstalledPlugin(): {
        plugins: any;
        count: number;
    };
    isPluginInstalled(pluginId: any): boolean;
}
