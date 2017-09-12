import { UIBaseComponent } from '../../ui-components/UIComponent';
export declare class InstallNewPluginsView extends UIBaseComponent {
    private stackedPage;
    private tabbedView;
    private communityPluginsView;
    constructor();
    private buildUI();
    createSimpleEmptyView(color: string): HTMLElement;
    destroy(): void;
}
