import { UIBaseComponent } from '../../../ui-components/UIComponent';
export declare class CommunityPluginsView extends UIBaseComponent {
    private pluginList;
    private searchForm;
    private searchTextEditor;
    private btnGroupPlatformChooser;
    private btnChooseIOS;
    private btnChooseAndroid;
    private btnChooseBrowser;
    private lineLoader;
    private currentProjectRoot;
    private queryResultsMessage;
    constructor();
    protected initUI(): void;
    private doInstallPlugin(pluginInfo);
    private doUninstallPlugin(pluginInfo);
    private setQueryResultMessage(count?);
    /**
     * Submit the search to the npm registry
     */
    private submitSearch();
    private showProgress(show);
    destroy(): void;
}
