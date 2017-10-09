'use babel';
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
            Logger.consoleLog("Registering Cordova Plugins Provider: ", providerFactory);
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