import { UIBaseComponent } from '../../ui-components/UIComponent';
import { CordovaPluginsProviderService } from '../../DEWorkbench/services/CordovaPluginsProvidersManager';
export declare class ProvidedPluginsView extends UIBaseComponent {
    private pluginList;
    private lineLoader;
    private currentProjectRoot;
    private pluginsProvider;
    private extendedUIContainer;
    constructor();
    protected initUI(): void;
    private doInstallPlugin(pluginInfo);
    private doUninstallPlugin(pluginInfo);
    private markInstalledPlugins(pluginList, installedPlugins);
    private showProgress(show);
    destroy(): void;
    setPluginsProvider(provider: CordovaPluginsProviderService): ProvidedPluginsView;
    reloadPluginList(): ProvidedPluginsView;
}
