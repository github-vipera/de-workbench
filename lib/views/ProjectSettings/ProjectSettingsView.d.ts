import { UIPane } from '../../ui-components/UIPane';
export declare class ProjectSettingsView extends UIPane {
    private projectRoot;
    private projectId;
    private tabbedView;
    private installedPluginsView;
    private installNewPluginsView;
    private variantsView;
    private appSignatureView;
    private generalSettingsView;
    constructor(params: any);
    private reloadProjectSettings();
    protected createUI(): HTMLElement;
    destroy(): void;
}
