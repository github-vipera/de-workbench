import { UIBaseComponent } from '../../ui-components/UIComponent';
export declare class InstalledPluginsView extends UIBaseComponent {
    private pluginList;
    private stackedPage;
    private lineLoader;
    private currentProjectRoot;
    private fsWatcher;
    constructor();
    private buildUI();
    private showProgress(show);
    private doUninstallPlugin(pluginInfo);
    reload(): void;
    destroy(): void;
}
