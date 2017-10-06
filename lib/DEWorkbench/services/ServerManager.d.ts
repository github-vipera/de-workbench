export declare enum ServerStatus {
    Stopped = 0,
    Starting = 1,
    Running = 2,
    Stopping = 3,
}
export interface ServerInstance {
    start(): any;
    stop(): any;
    status: ServerStatus;
    configure(configuration: any): any;
    addEventListener(event: string, listener: any): any;
    removeEventListener(event: string, listener: any): any;
    getConfigurator(configuration: any): ServerInstanceConfigurator;
}
export interface ServerInstanceConfigurator {
    getConfiguration(): any;
    addEventListener(event: string, listener: any): any;
    removeEventListener(event: string, listener: any): any;
    getConfigurationPane(): HTMLElement;
    revertChanges(): any;
    applyConfiguration(configuration: any): any;
}
export interface ServerProvider {
    createInstance(configuration: any): ServerInstance;
    destroyInstance(instance: ServerInstance): any;
    getProviderName(): string;
}
export declare class ServerManager {
    static readonly EVT_PROVIDER_REGISTERED: string;
    static readonly EVT_SERVER_INSTANCE_CREATED: string;
    static readonly EVT_SERVER_INSTANCE_REMOVED: string;
    static readonly EVT_SERVER_INSTANCE_CONFIG_CHANGED: string;
    static readonly EVT_SERVER_INSTANCE_NAME_CHANGED: string;
    static readonly EVT_SERVER_INSTANCE_STATUS_CHANGED: string;
    private static instance;
    private providers;
    private instances;
    private pendingConfigInstances;
    private constructor();
    static getInstance(): ServerManager;
    protected checkForDefaultPreferences(): void;
    protected reloadFromConfiguration(): Promise<{}>;
    loadSettingsForServerInstance(instanceId: string): any;
    protected checkForPendingInstances(): Promise<any>;
    registerProvider(provider: ServerProvider): ServerProviderWrapper;
    getProviders(): Array<ServerProviderWrapper>;
    protected getProviderByName(providerName: string): ServerProviderWrapper;
    protected getProviderById(providerId: string): ServerProviderWrapper;
    protected restoreServerInstance(providerId: string, instanceName: string, previousInstanceId: string, configuration: any): ServerInstanceWrapper;
    createServerInstance(providerId: string, instanceName: string, configuration: any): ServerInstanceWrapper;
    removeServerInstance(serverInstance: ServerInstance): void;
    private registerInstance(providerName, providerId, instanceName, serverInstance, configuration, oldServerInstanceId?);
    storeInstanceConfiguration(instanceId: string, configuration: any): Promise<any>;
    changeInstanceName(instanceId: string, name: string): Promise<any>;
    private onServerInstanceStatusChanged(serverInstance);
    private unregisterInstance(instanceWrapped);
    getInstances(): Array<ServerInstanceWrapper>;
    getInstancesForProvider(providerName: string): Array<ServerInstanceWrapper>;
    getInstanceById(instanceId: string): ServerInstanceWrapper;
    private getInstanceWrapper(serverInstance);
}
export declare class ServerProviderWrapper implements ServerProvider {
    _provider: ServerProvider;
    _id: string;
    constructor(serverProvider: ServerProvider);
    createInstance(configuration: any): ServerInstance;
    destroyInstance(instance: ServerInstance): void;
    getProviderName(): string;
    readonly id: string;
    provider(): ServerProvider;
    static idFromName(name: string): string;
}
export declare class ServerInstanceWrapper implements ServerInstance {
    _serverInstance: ServerInstance;
    _instanceId: string;
    _configuration: any;
    _providerName: any;
    _name: string;
    constructor(providerName: string, instanceName: string, serverInstance: ServerInstance, configuration: any);
    readonly name: string;
    readonly provider: string;
    protected onDidStatusChange(evt: any): void;
    readonly configuration: any;
    readonly serverInstance: ServerInstance;
    readonly instanceId: string;
    destroy(): void;
    start(): void;
    stop(): void;
    configure(configuration: any): void;
    addEventListener(event: string, listener: any): void;
    removeEventListener(event: string, listener: any): void;
    readonly status: ServerStatus;
    getConfigurator(configuration: any): ServerInstanceConfigurator;
    setName(name: string): void;
    readonly statusStr: string;
}
