export declare class EventSupport {
    private _evtListeners;
    constructor();
    addEventListener(listener: EventSupportDelegate): void;
    removeEventListener(listener: EventSupportDelegate): void;
    removeAllListeners(): void;
    fireEvent(name: string, ...data: any[]): void;
}
export declare type EventSupportDelegate = (name: string, ...data) => void;
