import { UIPane } from '../../ui-components/UIPane';
import { ServerProviderWrapper, ServerInstanceWrapper } from '../../DEWorkbench/services/ServerManager';
import { UITreeItem } from '../../ui-components/UITreeView';
export declare class ServersView extends UIPane {
    private treeModel;
    private treeView;
    private toolbar;
    private subscriptions;
    constructor(params: any);
    protected createUI(): HTMLElement;
    protected doStartServer(evt: any): void;
    protected doStopServer(evt: any): void;
    protected updateToolbar(nodeType: string): void;
    protected doToolbarAction(action: string): void;
    protected doToolbarActionForNode(action: string, nodeItem: UITreeItem): void;
    destroy(): void;
    private createNewServerInstanceForNode(nodeItem);
    protected removeServerInstanceForNode(nodeItem: ServerInstanceItem): void;
    protected startServerInstanceForNode(nodeItem: ServerInstanceItem): void;
    protected stopServerInstanceForNode(nodeItem: ServerInstanceItem): void;
    protected configureServerInstanceForNode(nodeItem: ServerInstanceItem): void;
    protected createNewServerProviderFor(serverProvider: ServerProviderWrapper): void;
    protected doConfigureInstance(serverInstance: ServerInstanceWrapper, isNew: boolean): void;
    protected removeServerInstance(serverInstance: ServerInstanceWrapper): void;
}
export declare class ServerInstanceItem implements UITreeItem {
    serverInstance: ServerInstanceWrapper;
    id: string;
    name: string;
    className: string;
    icon: string;
    expanded: boolean;
    listener: any;
    attributes: {
        name: string;
        value: string;
    }[];
    constructor(serverInstance: ServerInstanceWrapper, listener: any);
    protected onServerStatusChanged(notify: boolean): void;
    protected toIdFromName(name: string): string;
}
