import { PushSender, PushMessage } from './PushSender';
export declare class GCMService implements PushSender {
    private projectRoot;
    private configuration;
    private ready;
    constructor();
    initialize(configuration: any): void;
    sendPushMessage(message: PushMessage): Promise<any>;
    protected toGCMNotification(pushData: PushMessage): any;
    isReady(): boolean;
}
