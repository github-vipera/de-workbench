import { PlatformServerConfig, LiveActions } from './PlatformServer';
export interface JSSession {
    getId(): string;
    execJSCommand(jsCommand: string): Promise<any>;
    didJSResultReceived(listener: (...args: any[]) => void): void;
    close(): any;
}
export declare class RuntimeSessionHandler {
    private platformServer;
    private consoleHandler;
    private events;
    constructor(srvConf: PlatformServerConfig);
    private createAndStartServer(srvConf);
    static createRuntimeSession(srvConf: PlatformServerConfig): RuntimeSessionHandler;
    canOpenJSSession(): boolean;
    isPlatformServerRunning(): boolean;
    openJSSession(): JSSession;
    openConsole(): ConsoleHandler;
    private openSessionForJSCommands();
    stopServer(): Promise<void>;
    sendAction(action: LiveActions): Promise<void>;
}
export declare class ConsoleHandler {
    private session;
    private console;
    setSession(session: JSSession): void;
    openConsole(): void;
    private createConsoleBridge();
    private onCmdEval(arg);
    close(): void;
}
