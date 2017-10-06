import { UIPane } from '../../ui-components/UIPane';
import { ServerInstanceWrapper } from '../../DEWorkbench/services/ServerManager';
export declare class ServerInstanceConfigurationView extends UIPane {
    _serverInstance: ServerInstanceWrapper;
    private _configCtrl;
    _overlayEl: HTMLElement;
    _removed: boolean;
    constructor(uri: string);
    protected createUI(): HTMLElement;
    protected showOverlay(show: boolean): void;
    protected onInstanceRemoved(): void;
    didOpen(): void;
    protected onInstanceRenamed(): void;
    updateTitle(instanceName: string): void;
}
