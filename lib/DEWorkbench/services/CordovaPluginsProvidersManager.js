'use babel';
/*!
 * Dynamic Engine Workbench
 * Copyright(c) 2017 Dynamic Engine Team @ Vipera Plc
 * MIT Licensed
 */
import { Logger } from '../../logger/Logger';
export class CordovaPluginsProvidersManager {
    constructor() {
        Logger.getInstance().debug("Creating CordovaPluginsProvidersManager...");
        this.providerFactories = [];
    }
    static getInstance() {
        if (!CordovaPluginsProvidersManager.instance) {
            CordovaPluginsProvidersManager.instance = new CordovaPluginsProvidersManager();
        }
        return CordovaPluginsProvidersManager.instance;
    }
    registerProviderFactory(providerFactory) {
        try {
            Logger.getInstance().debug("Registering Cordova Plugins Provider Factory: ", providerFactory);
            console.log("Registering Cordova Plugins Provider: ", providerFactory);
            this.providerFactories.push(providerFactory);
        }
        catch (ex) {
            Logger.getInstance().error("Error registering Cordova Plugins Provider: ", ex);
            console.error("Error registering Cordova Plugins Provider: ", ex);
        }
    }
    getProviderFactories() {
        return this.providerFactories;
    }
}
//# sourceMappingURL=CordovaPluginsProvidersManager.js.map