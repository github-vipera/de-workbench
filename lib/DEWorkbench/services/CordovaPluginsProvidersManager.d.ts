import { CordovaPlugin } from '../../cordova/Cordova';
export interface CordovaPluginsProviderFactory {
    createProvider(): CordovaPluginsProviderService;
}
export interface CordovaPluginsProviderService {
    getCordovaPlugins(): Promise<Array<CordovaPlugin>>;
    getProviderName(): string;
    getExtendedUI(): HTMLElement;
    addEventHandler(handler: Function): any;
}
export declare class CordovaPluginsProvidersManager {
    private static instance;
    private providerFactories;
    private constructor();
    static getInstance(): CordovaPluginsProvidersManager;
    registerProviderFactory(providerFactory: CordovaPluginsProviderFactory): void;
    getProviderFactories(): Array<CordovaPluginsProviderFactory>;
}
