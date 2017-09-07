'use babel';
/*!
 * Dynamic Engine Workbench
 * Copyright(c) 2017 Dynamic Engine Team @ Vipera Plc
 * MIT Licensed
 */
import { Logger } from '../../logger/Logger';
export var ServerStatus;
(function (ServerStatus) {
    ServerStatus[ServerStatus["Stopped"] = 0] = "Stopped";
    ServerStatus[ServerStatus["Starting"] = 1] = "Starting";
    ServerStatus[ServerStatus["Running"] = 2] = "Running";
    ServerStatus[ServerStatus["Stopping"] = 3] = "Stopping";
})(ServerStatus || (ServerStatus = {}));
export class ExternalServerManager {
    constructor() {
        Logger.getInstance().debug("Creating ExternalServerManager...");
        this.providers = [];
        this.instances = [];
    }
    static getInstance() {
        if (!ExternalServerManager.instance) {
            ExternalServerManager.instance = new ExternalServerManager();
        }
        return ExternalServerManager.instance;
    }
    registerProvider(provider) {
        try {
            Logger.getInstance().debug("Registering Server Provider: ", provider);
            console.log("Registering Server Provider: ", provider);
            this.providers.push(provider);
        }
        catch (ex) {
            Logger.getInstance().error("Error registering Server Provider: ", ex);
            console.error("Error registering Server Provider: ", ex);
        }
    }
    getProviders() {
        return this.providers;
    }
    getProviderByName(providerName) {
        for (var i = 0; i < this.providers.length; i++) {
            if (this.providers[i].getProviderName() === providerName) {
                return this.providers[i];
            }
        }
        return null;
    }
    createServerInstance(providerName, configuration) {
        let serverProvider = this.getProviderByName(providerName);
        if (serverProvider) {
            let instance = serverProvider.createInstance(configuration);
            this.instances.push(instance);
            return instance;
        }
        else {
            throw ("Server Provider not found for '" + providerName + "'.");
        }
    }
}
//# sourceMappingURL=ExternalServerManager.js.map