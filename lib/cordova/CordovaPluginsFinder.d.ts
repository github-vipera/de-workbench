import { CordovaPlugin } from './Cordova';
export declare class CordovaPluginsFinder {
    protected pluginsData: any;
    constructor();
    private buildQueryParamsString(names, keywords, platforms?);
    search(names: any, keywords: any, platforms: any): Promise<Array<CordovaPlugin>>;
    private static filterForPlatforms(plugin, platforms);
    private static readAvailablePlatforms(jsonRaw);
    private static isPlatformSupported(jsonRaw, platform);
    private static filterPlugin(jsonRaw, platforms);
    private static isCordovaPlugin(jsonRaw);
}
