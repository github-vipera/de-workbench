import { PushSender, PushMessage } from './PushSender';
export interface PushServiceOptions {
    apn: any;
    gcm: any;
}
export declare enum PushPlatform {
    APN = "apn",
    GCM = "gcm",
}
export declare class PushService {
    static readonly EVT_PUSH_NOTIFICATION_SENT: string;
    private platforms;
    private options;
    constructor();
    protected initPlatformServices(): void;
    sendPushMessage(message: PushMessage, platform: PushPlatform, options: PushServiceOptions): Promise<any>;
    protected getConfigForPlatform(options: PushServiceOptions, platform: PushPlatform): any;
    protected getSenderService(platform: PushPlatform): PushSender;
}
