/// <reference types="node" />
import { EventEmitter } from 'events';
export interface LiveActions {
    type: string;
    [name: string]: any;
}
export interface PlatformServerConfig {
    serveStaticAssets: boolean;
    platformPath: string;
    port: number;
    connectionTimeout?: number;
}
export interface PlatformServer {
    start(config: PlatformServerConfig): void;
    stop(): Promise<any>;
    clear(): Promise<any>;
    addEventListener(event: string, listener: (...args: any[]) => void): void;
    removeEventListener(event: string, listener?: (...args: any[]) => void): void;
    executeAction(action: LiveActions): Promise<any>;
    isRunning(): boolean;
}
export declare class PlatformServerImpl implements PlatformServer {
    private static nextSocketId;
    protected app: any;
    protected io: any;
    protected http: any;
    protected sockets: {};
    protected config: PlatformServerConfig;
    protected events: EventEmitter;
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
    isRunning(): boolean;
    addEventListener(event: string, listener: (...args: any[]) => void): void;
    removeEventListener(event: string, listener?: (...args: any[]) => void): void;
    static createNew(): PlatformServer;
}
