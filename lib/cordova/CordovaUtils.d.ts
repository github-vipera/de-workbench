export declare class CordovaUtils {
    private atomProject;
    constructor();
    scanDeviceParts(parts: Array<String>): any[];
    scanPlatformParts(parts: Array<String>, skipBrowser: boolean): {
        installed: any[];
        available: any[];
    };
    parseDeviceList(stringValue: any): any[];
    parsePlatformList(stringValue: any): any[] | {
        installed: any[];
        available: any[];
    };
    getPlatformValue(item: any): any;
    parsePluginList(stringValue: any): any[];
    parsePluginRecord(record: any): {
        id: any;
        version: any;
        name: any;
    };
    getInstalledPlatforms(rootProjectPath: string): any[] | {
        "installed": any[];
    };
    getPlatformPath(platform: string, basePath: string): String;
    getAndroidAssetsPath(basePath: string): String;
    getiOSAssetsPath(basePath: string): String;
    isCordovaProject(rootProjectPath: any): boolean;
}
