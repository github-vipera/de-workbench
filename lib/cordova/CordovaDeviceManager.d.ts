export interface CordovaDevice {
    targetId: string;
    name: string;
}
export declare class CordovaDeviceManager {
    private cordovaExecutor;
    constructor(projectPath: any);
    getDeviceList(platform: string): Promise<Array<CordovaDevice>>;
}
