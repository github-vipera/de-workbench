import { PushSender, PushMessage } from './PushSender';
export declare class APNService implements PushSender {
    private projectRoot;
    private configuration;
    private ready;
    private apnProvider;
    private options;
    constructor();
    initialize(configuration: any): void;
    sendPushMessage(message: PushMessage): Promise<any>;
    protected toApnNotification(message: PushMessage): any;
    isReady(): boolean;
}
