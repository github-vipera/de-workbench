'use babel';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Logger } from '../../logger/Logger';
import { EventBus } from '../EventBus';
import { GlobalPreferences } from '../GlobalPreferences';
import { UINotifications } from '../../ui-components/UINotifications';
const _ = require('lodash');
const GUID = require('guid');
var md5 = require('md5');
export var ServerStatus;
(function (ServerStatus) {
    ServerStatus[ServerStatus["Stopped"] = 0] = "Stopped";
    ServerStatus[ServerStatus["Starting"] = 1] = "Starting";
    ServerStatus[ServerStatus["Running"] = 2] = "Running";
    ServerStatus[ServerStatus["Stopping"] = 3] = "Stopping";
})(ServerStatus || (ServerStatus = {}));
export class ServerManager {
    static get EVT_PROVIDER_REGISTERED() { return "dewb.serverManager.provider.registered"; }
    static get EVT_SERVER_INSTANCE_CREATED() { return "dewb.serverManager.serverInstance.created"; }
    static get EVT_SERVER_INSTANCE_REMOVED() { return "dewb.serverManager.serverInstance.removed"; }
    static get EVT_SERVER_INSTANCE_CONFIG_CHANGED() { return "dewb.serverManager.serverInstance.configChanged"; }
    static get EVT_SERVER_INSTANCE_NAME_CHANGED() { return "dewb.serverManager.serverInstance.nameChanged"; }
    static get EVT_SERVER_INSTANCE_STATUS_CHANGED() { return "dewb.serverManager.serverInstance.statusChange"; }
    constructor() {
        Logger.getInstance().debug("Creating ServerManager...");
        this.providers = [];
        this.instances = [];
        this.checkForDefaultPreferences();
        this.reloadFromConfiguration();
    }
    static getInstance() {
        if (!ServerManager.instance) {
            ServerManager.instance = new ServerManager();
        }
        return ServerManager.instance;
    }
    checkForDefaultPreferences() {
        let preferences = GlobalPreferences.getInstance();
        let serverPrefs = preferences.get('server');
        if (!serverPrefs) {
            preferences.save('/server', { instances: [] });
        }
        let instancesPrefs = preferences.get('/server/instances');
        if (!instancesPrefs) {
            preferences.save('/server/instances', []);
        }
    }
    reloadFromConfiguration() {
        return new Promise((resolve, reject) => {
            let preferences = GlobalPreferences.getInstance();
            let instances = preferences.get('/server/instances');
            if (!instances) {
                instances = [];
            }
            this.pendingConfigInstances = _.cloneDeep(instances);
            this.checkForPendingInstances();
            resolve("done");
        });
    }
    loadSettingsForServerInstance(instanceId) {
        let preferences = GlobalPreferences.getInstance();
        let instances = preferences.get('/server/instances');
        if (!instances) {
            instances = [];
        }
        let instance = _.find(instances, { serverInstanceId: instanceId });
        return instance;
    }
    checkForPendingInstances() {
        return __awaiter(this, void 0, void 0, function* () {
            for (var i = 0; i < this.pendingConfigInstances.length; i++) {
                let pendingInstance = this.pendingConfigInstances[i];
                let providerName = pendingInstance["providerName"];
                let providerId = pendingInstance["providerId"];
                let serverInstanceId = pendingInstance["serverInstanceId"];
                let instanceName = pendingInstance["instanceName"];
                let serverProvider = this.getProviderById(providerId);
                if (serverProvider) {
                    Logger.consoleLog("Server provider " + providerName + " available. Creating instance...");
                    let serverInstance = yield this.restoreServerInstance(providerId, instanceName, serverInstanceId, pendingInstance["configuration"]);
                    let newInstanceId = serverInstance.instanceId;
                    this.pendingConfigInstances[i]["toRemove"] = true;
                }
                else {
                    Logger.consoleLog("Server provider: " + providerName + " not yet available.");
                }
            }
            _.remove(this.pendingConfigInstances, function (intance) {
                return intance["toRemove"];
            });
        });
    }
    registerProvider(provider) {
        try {
            Logger.getInstance().debug("Registering Server Provider: ", provider);
            Logger.consoleLog("Registering Server Provider: ", provider);
            let wrapper = new ServerProviderWrapper(provider);
            this.providers.push(wrapper);
            this.checkForPendingInstances();
            EventBus.getInstance().publish(ServerManager.EVT_PROVIDER_REGISTERED, wrapper);
            return wrapper;
        }
        catch (ex) {
            Logger.getInstance().error("Error registering Server Provider: ", ex);
            console.error("Error registering Server Provider: ", ex);
            throw ex;
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
    getProviderById(providerId) {
        return _.find(this.providers, { id: providerId });
    }
    restoreServerInstance(providerId, instanceName, previousInstanceId, configuration) {
        let serverProvider = this.getProviderById(providerId);
        if (serverProvider) {
            Logger.getInstance().info("Restoring server instance for " + serverProvider.getProviderName() + "...");
            let instance = serverProvider.createInstance(configuration);
            let wrapper = this.registerInstance(serverProvider.getProviderName(), serverProvider.id, instanceName, instance, configuration, previousInstanceId);
            EventBus.getInstance().publish(ServerManager.EVT_SERVER_INSTANCE_CREATED, wrapper);
            Logger.getInstance().info("Server instance restored " + serverProvider.getProviderName() + " [instanceId:" + wrapper.instanceId + "].");
            return wrapper;
        }
        else {
            Logger.getInstance().error("Error restoring server instance for " + serverProvider.getProviderName() + ": Provider not found.");
            throw ("Server Provider not found for '" + providerId + "'.");
        }
    }
    createServerInstance(providerId, instanceName, configuration) {
        let serverProvider = this.getProviderById(providerId);
        if (serverProvider) {
            Logger.getInstance().info("Creating new server instance for " + serverProvider.getProviderName() + "...");
            let instance = serverProvider.createInstance(configuration);
            let wrapper = this.registerInstance(serverProvider.getProviderName(), serverProvider.id, instanceName, instance, configuration);
            EventBus.getInstance().publish(ServerManager.EVT_SERVER_INSTANCE_CREATED, wrapper);
            Logger.getInstance().info("New server instance created " + serverProvider.getProviderName() + " [instanceId:" + wrapper.instanceId + "].");
            return wrapper;
        }
        else {
            Logger.getInstance().error("Error creating new server instance for " + serverProvider.getProviderName() + ": Provider not found.");
            throw ("Server Provider not found for '" + providerId + "'.");
        }
    }
    removeServerInstance(serverInstance) {
        let wrapped = this.getInstanceWrapper(serverInstance);
        let instanceId = wrapped;
        let instanceName = wrapped.name;
        if (wrapped.status === ServerStatus.Running) {
            wrapped.stop();
        }
        this.unregisterInstance(wrapped);
        Logger.getInstance().info("Server instance removed " + wrapped.name + " [instanceId:" + instanceId + "].");
        UINotifications.showInfo("Server '" + instanceName + "' was removed.");
    }
    registerInstance(providerName, providerId, instanceName, serverInstance, configuration, oldServerInstanceId) {
        Logger.getInstance().debug("Registering new server instance for provider=" + providerName + "...");
        let wrapper = new ServerInstanceWrapper(providerName, instanceName, serverInstance, configuration);
        let preferences = GlobalPreferences.getInstance();
        let prefInstances = preferences.get('/server/instances');
        if (!prefInstances) {
            prefInstances = [];
        }
        if (oldServerInstanceId) {
            let instance = _.find(prefInstances, { serverInstanceId: oldServerInstanceId });
            instance["serverInstanceId"] = wrapper.instanceId;
        }
        else {
            let instancePrefs = {
                providerName: providerName,
                providerId: providerId,
                serverInstanceId: wrapper.instanceId,
                instanceName: wrapper.name,
                configuration: configuration
            };
            prefInstances.push(instancePrefs);
        }
        preferences.save('/server/instances', prefInstances);
        Logger.getInstance().debug("New server instance registered with id=" + wrapper.instanceId + ".");
        this.instances.push(wrapper);
        wrapper.addEventListener('onDidStatusChange', (evt) => {
            this.onServerInstanceStatusChanged(evt);
        });
        return wrapper;
    }
    storeInstanceConfiguration(instanceId, configuration) {
        Logger.getInstance().debug("Saving server instance preferences for id=" + instanceId + "...");
        return new Promise((resolve, reject) => {
            let preferences = GlobalPreferences.getInstance();
            let instances = preferences.get('/server/instances');
            if (!instances) {
                Logger.getInstance().error("Error saving server instance preferences for id=" + instanceId + ": server instance preferences not found.");
                reject("No server instances defined.");
                return;
            }
            let instance = _.find(instances, { serverInstanceId: instanceId });
            if (!instance) {
                reject("Server instance not found.");
                Logger.getInstance().error("Error saving server instance preferences for id=" + instanceId + ": server instance not found.");
                return;
            }
            instance.configuration = configuration;
            preferences.save('/server/instances', instances);
            let instanceWrapped = this.getInstanceById(instanceId);
            EventBus.getInstance().publish(ServerManager.EVT_SERVER_INSTANCE_CONFIG_CHANGED, instanceWrapped);
            Logger.getInstance().debug("Server instance preferences saved for id=" + instanceId + ".");
            resolve(instanceId);
        });
    }
    changeInstanceName(instanceId, name) {
        return new Promise((resolve, reject) => {
            let preferences = GlobalPreferences.getInstance();
            let instances = preferences.get('/server/instances');
            if (!instances) {
                Logger.getInstance().error("Error changing server instance name for id=" + instanceId + ": server instance preferences not found.");
                reject("No server instances defined.");
                return;
            }
            let instance = _.find(instances, { serverInstanceId: instanceId });
            if (!instance) {
                reject("Server instance not found.");
                Logger.getInstance().error("Error changing server instance name for id=" + instanceId + ": server instance not found.");
                return;
            }
            instance.instanceName = name;
            preferences.save('/server/instances', instances);
            let instanceWrapped = this.getInstanceById(instanceId);
            instanceWrapped.setName(name);
            EventBus.getInstance().publish(ServerManager.EVT_SERVER_INSTANCE_NAME_CHANGED, instanceWrapped);
            Logger.getInstance().debug("Server instance name changed to '" + name + "' for id=" + instanceId + ".");
            resolve(instanceId);
        });
    }
    onServerInstanceStatusChanged(serverInstance) {
        let wrapper = this.getInstanceWrapper(serverInstance);
        if (wrapper) {
            Logger.getInstance().info("Server " + wrapper.name + "' [" + wrapper.instanceId + "] now is " + wrapper.statusStr);
            EventBus.getInstance().publish(ServerManager.EVT_SERVER_INSTANCE_STATUS_CHANGED, wrapper);
            UINotifications.showInfo("Server '" + wrapper.name + "' is now " + wrapper.statusStr);
        }
        else {
        }
    }
    unregisterInstance(instanceWrapped) {
        let instanceId = instanceWrapped.instanceId;
        let instanceName = instanceWrapped.name;
        let preferences = GlobalPreferences.getInstance();
        let prefInstances = preferences.get('/server/instances');
        if (!prefInstances) {
            prefInstances = [];
        }
        _.remove(prefInstances, { serverInstanceId: instanceWrapped.instanceId });
        preferences.save('/server/instances', prefInstances);
        _.remove(this.instances, { instanceId: instanceWrapped.instanceId });
        instanceWrapped.destroy();
        EventBus.getInstance().publish(ServerManager.EVT_SERVER_INSTANCE_REMOVED, instanceId);
    }
    getInstances() {
        return this.instances;
    }
    getInstancesForProvider(providerName) {
        return _.filter(this.instances, { provider: providerName });
    }
    getInstanceById(instanceId) {
        return _.find(this.instances, { instanceId: instanceId });
    }
    getInstanceWrapper(serverInstance) {
        if (serverInstance instanceof ServerInstanceWrapper) {
            return serverInstance;
        }
        for (var i = 0; i < this.instances.length; i++) {
            if (this.instances[i].serverInstance === serverInstance) {
                return (this.instances[i]);
            }
        }
        return null;
    }
}
export class ServerProviderWrapper {
    constructor(serverProvider) {
        this._provider = serverProvider;
        this._id = ServerProviderWrapper.idFromName(this._provider.getProviderName());
    }
    createInstance(configuration) {
        return this._provider.createInstance(configuration);
    }
    destroyInstance(instance) {
        this._provider.destroyInstance(instance);
    }
    getProviderName() {
        return this._provider.getProviderName();
    }
    get id() {
        return this._id;
    }
    provider() {
        return this._provider;
    }
    static idFromName(name) {
        let id = md5(name);
        return id;
    }
}
export class ServerInstanceWrapper {
    constructor(providerName, instanceName, serverInstance, configuration) {
        this._instanceId = GUID.raw();
        this._providerName = providerName;
        this._name = instanceName;
        this._configuration = configuration;
        this._serverInstance = serverInstance;
        this._serverInstance.addEventListener('onDidStatusChange', this.onDidStatusChange);
    }
    get name() {
        return this._name;
    }
    get provider() {
        return this._providerName;
    }
    onDidStatusChange(evt) {
    }
    get configuration() {
        return this._configuration;
    }
    get serverInstance() {
        return this._serverInstance;
    }
    get instanceId() {
        return this._instanceId;
    }
    destroy() {
        this._serverInstance.removeEventListener('onDidStatusChange', this.onDidStatusChange);
    }
    start() {
        try {
            this._serverInstance.start();
        }
        catch (err) {
            UINotifications.showError("Start '" + this._name + "' Server Error:\n" + err);
        }
    }
    stop() {
        try {
            this._serverInstance.stop();
        }
        catch (err) {
            UINotifications.showError("Stop '" + this._name + "' Server Error: " + err);
        }
    }
    configure(configuration) {
        this._serverInstance.configure(configuration);
    }
    addEventListener(event, listener) {
        this._serverInstance.addEventListener(event, listener);
    }
    removeEventListener(event, listener) {
        this._serverInstance.removeEventListener(event, listener);
    }
    get status() {
        return this._serverInstance.status;
    }
    getConfigurator(configuration) {
        return this._serverInstance.getConfigurator(configuration);
    }
    setName(name) {
        this._name = name;
    }
    get statusStr() {
        if (this.status === ServerStatus.Running) {
            return "Running";
        }
        else if (this.status === ServerStatus.Stopped) {
            return "Stopped";
        }
        else if (this.status === ServerStatus.Starting) {
            return "Starting";
        }
        else if (this.status === ServerStatus.Stopping) {
            return "Stopping";
        }
    }
}
//# sourceMappingURL=ServerManager.js.map