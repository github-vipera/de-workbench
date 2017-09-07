import { UIBaseComponent } from '../../ui-components/UIComponent';
export declare class GeneralSettingsView extends UIBaseComponent {
    private tabbedView;
    private stackedPage;
    private appInfoView;
    private installedPlatformsView;
    constructor();
    private buildUI();
    createSimpleEmptyView(color: string): HTMLElement;
}
