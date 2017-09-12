export declare class EventBus {
    static readonly EVT_PROJECT_CHANGED: string;
    static readonly EVT_PATH_CHANGED: string;
    static readonly EVT_PLUGIN_ADDED: string;
    static readonly EVT_PLUGIN_REMOVED: string;
    static readonly EVT_PLATFORM_ADDED: string;
    static readonly EVT_PLATFORM_REMOVED: string;
    static readonly EVT_WORKBENCH_PLUGIN_ADDED: string;
    private static instance;
    private _eventBus;
    private eventEmitter;
    private constructor();
    static getInstance(): EventBus;
    subscribe(topic: string, listener: any): void;
    publish(topic: string, ...args: any[]): void;
    unsubscribe(topic: string, listener: any): void;
    on(topic: string, listener: any): void;
    emit(topic: string, ...args: any[]): void;
}
