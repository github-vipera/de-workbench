import { CordovaPlatform } from '../../cordova/Cordova';
import { UIBaseComponent } from '../../ui-components/UIComponent';
import { UIListView } from '../../ui-components/UIListView';
import { UILineLoader } from '../../ui-components/UILineLoader';
export declare class InstalledPlatformsView extends UIBaseComponent {
    private mainFormElement;
    private installedPlatformList;
    private installedPlatformListModel;
    private currentProjectPath;
    private btnInstallNewPlatform;
    private lineLoader;
    constructor();
    private buildUI();
    doAction(platformInfo: CordovaPlatform, action: number): void;
    doUninstallPlatform(platformName: string): void;
    doInstallPlatform(platformName: string): void;
    updateAvailableToInstallPlatforms(): void;
    reload(): void;
    createListControlBlock(caption: string, control: UIListView, loader: UILineLoader): HTMLElement;
}
