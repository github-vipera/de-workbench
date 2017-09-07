import { CordovaPlugin } from './Cordova';
/**
 * This class allows to search plugins from the community repository
 */
export declare class CordovaPluginsFinder {
    protected pluginsData: any;
    constructor();
    /**
     * Build the query
     */
    private buildQueryParamsString(names, keywords, platforms?);
    /**
     * Search plugins from community
     */
    search(names: any, keywords: any, platforms: any): Promise<Array<CordovaPlugin>>;
    private static filterForPlatforms(plugin, platforms);
    private static readAvailablePlatforms(jsonRaw);
    private static isPlatformSupported(jsonRaw, platform);
    private static filterPlugin(jsonRaw, platforms);
    private static isCordovaPlugin(jsonRaw);
}
