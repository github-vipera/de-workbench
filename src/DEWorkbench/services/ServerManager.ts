'use babel'

/*!
 * Dynamic Engine Workbench
 * Copyright(c) 2017 Dynamic Engine Team @ Vipera Plc
 * MIT Licensed
 */

import { Logger } from '../../logger/Logger'
import { CordovaPlugin } from '../../cordova/Cordova'
import { EventBus } from '../EventBus'
import { GlobalPreferences } from '../GlobalPreferences'
import { UINotifications } from '../../ui-components/UINotifications'

const _ = require('lodash');
const GUID = require('guid');
var md5 = require('md5');

export enum ServerStatus {
  Stopped = 0,
  Starting,
  Running,
  Stopping
}

export interface ServerInstance {
  start();
  stop();
  status:ServerStatus;
  configure(configuration:any);
  addEventListener(event:string, listener);
  removeEventListener(event:string, listener);
  getConfigurator(configuration:any):ServerInstanceConfigurator;
}

export interface ServerInstanceConfigurator {
    getConfiguration():any;
    addEventListener(event:string, listener);
    removeEventListener(event:string, listener);
    getConfigurationPane():HTMLElement;
    revertChanges();
    applyConfiguration(configuration:any);
}

export interface ServerProvider {
  createInstance(configuration:any):ServerInstance;
  destroyInstance(instance:ServerInstance);
  getProviderName():string;
}

export class ServerManager {

  public static get EVT_PROVIDER_REGISTERED():string { return "dewb.serverManager.provider.registered"; }
  public static get EVT_SERVER_INSTANCE_CREATED():string { return "dewb.serverManager.serverInstance.created"; }
  public static get EVT_SERVER_INSTANCE_REMOVED():string { return "dewb.serverManager.serverInstance.removed"; }
  public static get EVT_SERVER_INSTANCE_CONFIG_CHANGED():string { return "dewb.serverManager.serverInstance.configChanged"; }
  public static get EVT_SERVER_INSTANCE_NAME_CHANGED():string { return "dewb.serverManager.serverInstance.nameChanged"; }
  public static get EVT_SERVER_INSTANCE_STATUS_CHANGED():string { return "dewb.serverManager.serverInstance.statusChange"; }


  private static instance:ServerManager;
  private providers:Array<ServerProviderWrapper>
  private instances:Array<ServerInstanceWrapper>
  private pendingConfigInstances:Array<any> //are the configured instances, ready to instantiated when the provider will ben installed
  //private _preferences:GlobalPreferences;

  private constructor() {
    Logger.getInstance().debug("Creating ServerManager...")
    this.providers = [];
    this.instances = [];
    //this._preferences = GlobalPreferences.getInstance();
    //let instances = this._preferences.get('/server/instances')
    this.checkForDefaultPreferences();
    this.reloadFromConfiguration();
  }

  static getInstance() {
      if (!ServerManager.instance) {
          ServerManager.instance = new ServerManager();
      }
      return ServerManager.instance;
  }

  protected checkForDefaultPreferences(){
    let preferences = GlobalPreferences.getInstance();
    let serverPrefs = preferences.get('server')
    if (!serverPrefs){
      preferences.save('/server', { instances: [] })
    }
    let instancesPrefs = preferences.get('/server/instances')
    if (!instancesPrefs){
      preferences.save('/server/instances', [])
    }
  }

  /**
   * Reload global preferences and restore saved instances
   */
  protected reloadFromConfiguration(){
    return new Promise((resolve,reject)=>{
      let preferences = GlobalPreferences.getInstance();
      let instances = preferences.get('/server/instances')
      console.log("**** instances (reloadFromConfiguration) ", instances)
      if (!instances){
        instances = [];
      }
      this.pendingConfigInstances = _.cloneDeep(instances);
      this.checkForPendingInstances();
      resolve("done")
    });
  }

  /**
   * This method check pending instances for instantiation
   */
  protected async checkForPendingInstances():Promise<any>{
    console.log("**** instances (pendingConfigInstances) ", this.pendingConfigInstances)
    for (var i=0;i<this.pendingConfigInstances.length;i++){
      let pendingInstance = this.pendingConfigInstances[i];
      let providerName = pendingInstance["providerName"];
      let providerId = pendingInstance["providerId"];
      let serverInstanceId = pendingInstance["serverInstanceId"];
      let instanceName = pendingInstance["instanceName"];
      let serverProvider = this.getProviderById(providerId);
      if (serverProvider){
        console.log("Server provider " + providerName +" available. Creating instance...")
        let serverInstance = await this.restoreServerInstance(providerId, instanceName, serverInstanceId, pendingInstance["configuration"])
        let newInstanceId = serverInstance.instanceId;
        //TODO!! change id on config
        this.pendingConfigInstances[i]["toRemove"] = true;
      } else {
        console.log("Server provider: " + providerName +" not yet available.")
      }
    }
    //then remove all marked "toRemove"
    _.remove(this.pendingConfigInstances, function (intance) {
        return intance["toRemove"]
    });
  }

  /**
   * Register a new server provider
   */
  public registerProvider(provider:ServerProvider):ServerProviderWrapper{
    try {
      Logger.getInstance().debug("Registering Server Provider: ",provider)
      console.log("Registering Server Provider: ", provider)
      let wrapper = new ServerProviderWrapper(provider);
      this.providers.push(wrapper)
      this.checkForPendingInstances();
      EventBus.getInstance().publish(ServerManager.EVT_PROVIDER_REGISTERED, wrapper);
      return wrapper;
    } catch (ex){
      Logger.getInstance().error("Error registering Server Provider: ", ex)
      console.error("Error registering Server Provider: ", ex)
      throw ex;
    }
  }

  /**
   * Return the list of registered providers
   */
  public getProviders():Array<ServerProviderWrapper>{
    return this.providers;
  }

  protected getProviderByName(providerName:string):ServerProviderWrapper {
      for (var i=0;i<this.providers.length;i++){
        if (this.providers[i].getProviderName()===providerName){
          return this.providers[i];
        }
      }
      return null;
  }

  protected getProviderById(providerId:string):ServerProviderWrapper {
    return _.find(this.providers, { id : providerId});
  }

  /**
   * Restore a global preferences saved instanceName
   */
  protected restoreServerInstance(providerId:string, instanceName:string, previousInstanceId:string, configuration:any):ServerInstanceWrapper{
      let serverProvider:ServerProviderWrapper = this.getProviderById(providerId);
      if (serverProvider){
        Logger.getInstance().info("Restoring server instance for " + serverProvider.getProviderName()+"...")
        let instance = serverProvider.createInstance(configuration);
        let wrapper =  this.registerInstance(serverProvider.getProviderName(), serverProvider.id, instanceName, instance, configuration, previousInstanceId)
        EventBus.getInstance().publish(ServerManager.EVT_SERVER_INSTANCE_CREATED, wrapper);
        Logger.getInstance().info("Server instance restored " + serverProvider.getProviderName()+" [instanceId:"+wrapper.instanceId+"].")
        return wrapper;
      } else {
        Logger.getInstance().error("Error restoring server instance for " + serverProvider.getProviderName()+": Provider not found.")
        throw("Server Provider not found for '"+ providerId +"'.")
      }
  }

  /**
   * Create a new server instance
   */
  public createServerInstance(providerId:string, instanceName:string, configuration:any):ServerInstanceWrapper {
      let serverProvider:ServerProviderWrapper = this.getProviderById(providerId);
      if (serverProvider){
        Logger.getInstance().info("Creating new server instance for " + serverProvider.getProviderName()+"...")
        let instance = serverProvider.createInstance(configuration);
        let wrapper =  this.registerInstance(serverProvider.getProviderName(), serverProvider.id, instanceName, instance, configuration);
        EventBus.getInstance().publish(ServerManager.EVT_SERVER_INSTANCE_CREATED, wrapper);
        Logger.getInstance().info("New server instance created " + serverProvider.getProviderName()+" [instanceId:"+wrapper.instanceId+"].")
        return wrapper
      } else {
        Logger.getInstance().error("Error creating new server instance for " + serverProvider.getProviderName()+": Provider not found.")
        throw ("Server Provider not found for '"+ providerId +"'.")
      }
  }

  public removeServerInstance(serverInstance:ServerInstance){
    let wrapped = this.getInstanceWrapper(serverInstance);
    wrapped.stop()
    this.unregisterInstance(wrapped)
    Logger.getInstance().info("Server instance removed " + wrapped.name +" [instanceId:"+wrapped.instanceId+"].")
    EventBus.getInstance().publish(ServerManager.EVT_SERVER_INSTANCE_REMOVED, wrapped);
    UINotifications.showInfo("Server '" + wrapped.name +"' was removed.")
  }

  /**
   * Register a new server instance
   */
  private registerInstance(providerName:string, providerId:string, instanceName:string, serverInstance:ServerInstance, configuration:any, oldServerInstanceId?:string):ServerInstanceWrapper {
    Logger.getInstance().debug("Registering new server instance for provider=" + providerName +"...")
      let wrapper = new ServerInstanceWrapper(providerName, instanceName, serverInstance, configuration)
      let preferences = GlobalPreferences.getInstance();

      let prefInstances = preferences.get('/server/instances');
      console.log("**** instances (registerInstance)", prefInstances)
      if (!prefInstances){
        prefInstances = [];
      }

      if (oldServerInstanceId){
        //update existing
        let instance = _.find(prefInstances, { serverInstanceId : oldServerInstanceId});
        instance["serverInstanceId"] = wrapper.instanceId;
      } else {
        // store new
        let instancePrefs = {
          providerName: providerName,
          providerId: providerId,
          serverInstanceId: wrapper.instanceId,
          instanceName: wrapper.name,
          configuration: configuration
        }
        prefInstances.push(instancePrefs)
      }

      preferences.save('/server/instances', prefInstances);

      Logger.getInstance().debug("New server instance registered with id=" + wrapper.instanceId +".")
      this.instances.push(wrapper)

      //listen for events
      wrapper.addEventListener('onDidStatusChange', (evt)=>{
          this.onServerInstanceStatusChanged(evt)
      })
      return wrapper;
  }

  /**
   * Store the new configuration into the global preferences
   */
  public storeInstanceConfiguration(instanceId:string, configuration:any):Promise<any>{
    Logger.getInstance().debug("Saving server instance preferences for id=" + instanceId +"...")
    return new Promise((resolve,reject)=>{
      let preferences = GlobalPreferences.getInstance();
      let instances = preferences.get('/server/instances');
      if (!instances){
        Logger.getInstance().error("Error saving server instance preferences for id=" + instanceId +": server instance preferences not found.")
        reject("No server instances defined.")
        return;
      }
      let instance = _.find(instances, { serverInstanceId : instanceId});// _.find(instances, { serverInstanceId : instanceId});
      if (!instance){
        reject("Server instance not found.")
        Logger.getInstance().error("Error saving server instance preferences for id=" + instanceId +": server instance not found.")
        return;
      }
      instance.configuration = configuration;
      preferences.save('/server/instances', instances);
      let instanceWrapped = this.getInstanceById(instanceId);
      EventBus.getInstance().publish(ServerManager.EVT_SERVER_INSTANCE_CONFIG_CHANGED, instanceWrapped);
      Logger.getInstance().debug("Server instance preferences saved for id=" + instanceId +".")
      resolve(instanceId);
    })
  }

  /**
   * Store the new configuration into the global preferences
   */
  public changeInstanceName(instanceId:string, name:string):Promise<any>{
    return new Promise((resolve,reject)=>{
      let preferences = GlobalPreferences.getInstance();
      let instances = preferences.get('/server/instances');
      if (!instances){
        Logger.getInstance().error("Error changing server instance name for id=" + instanceId +": server instance preferences not found.")
        reject("No server instances defined.")
        return;
      }
      let instance = _.find(instances, { serverInstanceId : instanceId});// _.find(instances, { serverInstanceId : instanceId});
      if (!instance){
        reject("Server instance not found.")
        Logger.getInstance().error("Error changing server instance name for id=" + instanceId +": server instance not found.")
        return;
      }
      instance.instanceName = name;
      preferences.save('/server/instances', instances);
      let instanceWrapped = this.getInstanceById(instanceId);
      instanceWrapped.setName(name);
      EventBus.getInstance().publish(ServerManager.EVT_SERVER_INSTANCE_NAME_CHANGED, instanceWrapped);
      Logger.getInstance().debug("Server instance name changed to '"+ name +"' for id=" + instanceId +".")
      resolve(instanceId);
    })
  }

  private onServerInstanceStatusChanged(serverInstance:ServerInstance){
    let wrapper = this.getInstanceWrapper(serverInstance)
    Logger.getInstance().info("Server "+ wrapper.name +"' ["+ wrapper.instanceId +"] now is " + wrapper.statusStr)
    EventBus.getInstance().publish(ServerManager.EVT_SERVER_INSTANCE_STATUS_CHANGED, wrapper)
    UINotifications.showInfo("Server '" + wrapper.name +"' is now " + wrapper.statusStr)
  }

  /**
   * Unregister an instance
   */
  private unregisterInstance(instanceWrapped:ServerInstanceWrapper){
    EventBus.getInstance().publish(ServerManager.EVT_SERVER_INSTANCE_REMOVED, instanceWrapped);

    let preferences = GlobalPreferences.getInstance();
    let prefInstances = preferences.get('/server/instances');
    console.log("**** instances (registerInstance)", prefInstances)
    if (!prefInstances){
      prefInstances = [];
    }
    _.remove(prefInstances, { serverInstanceId : instanceWrapped.instanceId})
    preferences.save('/server/instances', prefInstances);

    _.remove(this.instances, { instanceId : instanceWrapped.instanceId})
    instanceWrapped.destroy();
  }

  /**
   * Return all current instances
   */
  public getInstances():Array<ServerInstanceWrapper>{
      return this.instances;
  }

  /**
   * Return instances for a given provider
   */
  public getInstancesForProvider(providerName:string):Array<ServerInstanceWrapper>{
      return _.filter(this.instances, { provider : providerName});
  }

  public getInstanceById(instanceId:string):ServerInstanceWrapper {
    return _.find(this.instances, { instanceId : instanceId});
  }

  /**
   * Return the wrapper for the given instance
   */
  private getInstanceWrapper(serverInstance:ServerInstance):ServerInstanceWrapper{
    if (serverInstance instanceof ServerInstanceWrapper){
      return serverInstance
    }
    for (var i=0;i<this.instances.length;i++){
      if (this.instances[i].serverInstance===serverInstance){
        return (this.instances[i]);
      }
    }
    return null;
  }

}

export class ServerProviderWrapper implements ServerProvider {
  _provider: ServerProvider;
  _id: string;
  constructor(serverProvider:ServerProvider){
    this._provider = serverProvider;
    this._id = ServerProviderWrapper.idFromName(name);
  }
  createInstance(configuration:any):ServerInstance {
    return this._provider.createInstance(configuration)
  }
  destroyInstance(instance:ServerInstance) {
    this._provider.destroyInstance(instance)
  }
  getProviderName():string {
    return this._provider.getProviderName()
  }
  public get id():string {
    return this._id;
  }
  public provider():ServerProvider {
    return this._provider
  }
  public static idFromName(name:string):string{
    let id = md5(name)
    return id;
  }

}

export class ServerInstanceWrapper implements ServerInstance {

  _serverInstance: ServerInstance;
  _instanceId: string;
  _configuration:any;
  _providerName: any;
  _name:string;

  constructor(providerName:string, instanceName:string, serverInstance: ServerInstance, configuration:any){
    this._instanceId = GUID.raw();
    this._providerName = providerName;
    this._name = instanceName;
    this._configuration = configuration;
    this._serverInstance = serverInstance;
    this._serverInstance.addEventListener('onDidStatusChange',this.onDidStatusChange)
  }

  public get name():string{
    return this._name;
  }

  public get provider():string{
    return this._providerName;
  }

  protected onDidStatusChange(evt){
    //TODO!!
  }

  public get configuration():any {
    return this._configuration;
  }

  public get serverInstance():ServerInstance {
    return this._serverInstance
  }

  public get instanceId():string{
    return this._instanceId;
  }

  public destroy(){
    this._serverInstance.removeEventListener('onDidStatusChange', this.onDidStatusChange)
  }

  public start(){
    this._serverInstance.start();
  }

  public stop(){
    this._serverInstance.stop();
  }

  public configure(configuration:any){
    this._serverInstance.configure(configuration);
  }

  addEventListener(event:string, listener) {
    this._serverInstance.addEventListener(event, listener);
  }

  removeEventListener(event:string, listener){
    this._serverInstance.removeEventListener(event, listener);
  }

  public get status():ServerStatus{
      return this._serverInstance.status;
  }

  getConfigurator(configuration:any):ServerInstanceConfigurator {
    return this._serverInstance.getConfigurator(configuration);
  }

  public setName(name:string){
    this._name = name;
  }

  public get statusStr():string{
    if (this.status===ServerStatus.Running){
      return "Running"
    }
    else if (this.status===ServerStatus.Stopped){
      return "Stopped"
    }
    else if (this.status===ServerStatus.Starting){
      return "Starting"
    }
    else if (this.status===ServerStatus.Stopping){
      return "Stopping"
    }
  }


}
