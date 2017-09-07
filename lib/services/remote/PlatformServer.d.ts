export interface LiveActions {
    type: string;
    [name: string]: any;
}
export interface PlatformServerConfig {
    platformPath: string;
    connectionTimeout?: number;
    port: number;
}
export interface PlatformServer {
    start(config: PlatformServerConfig): void;
    stop(): Promise<any>;
    clear(): Promise<any>;
    executeAction(action: LiveActions): Promise<any>;
}
export declare class PlatformServerImpl implements PlatformServer {
    private static nextSocketId;
    protected app: any;
    protected io: any;
    protected http: any;
    protected sockets: {};
    protected config: PlatformServerConfig;
    constructor();
    start(config: PlatformServerConfig): void;
    private initExpressApp(config);
    protected initExpressStaticServe(config: PlatformServerConfig): void;
    protected initInjectedFileServe(config: PlatformServerConfig): void;
    private initHttp(config);
    private initSocketIO(config);
    stop(): Promise<any>;
    clear(): Promise<void>;
    executeAction(action: LiveActions): Promise<any>;
    static createNew(): PlatformServer;
}
