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
  public static get EVT_SERVER_INSTANCE_STARTED():string { return "dewb.serverManager.serverInstance.started"; }
  public static get EVT_SERVER_INSTANCE_STOPPED():string { return "dewb.serverManager.serverInstance.stopped"; }

  private static instance:ServerManager;
  private providers:Array<ServerProviderWrapper>
  private instances:Array<ServerInstanceWrapper>

  private constructor() {
    Logger.getInstance().debug("Creating ServerManager...")
    this.providers = [];
    this.instances = [];
  }

  static getInstance() {
      if (!ServerManager.instance) {
          ServerManager.instance = new ServerManager();
      }
      return ServerManager.instance;
  }

  public registerProvider(provider:ServerProvider):ServerProviderWrapper{
    try {
      Logger.getInstance().debug("Registering Server Provider: ",provider)
      console.log("Registering Server Provider: ", provider)
      let wrapper = new ServerProviderWrapper(provider);
      this.providers.push(wrapper)
      EventBus.getInstance().publish(ServerManager.EVT_PROVIDER_REGISTERED, wrapper);
      return wrapper;
    } catch (ex){
      Logger.getInstance().error("Error registering Server Provider: ", ex)
      console.error("Error registering Server Provider: ", ex)
      throw ex;
    }
  }

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

  public createServerInstance(providerId:string, instanceName:string, configuration:any):ServerInstanceWrapper{
    let serverProvider:ServerProviderWrapper = this.getProviderById(providerId);
    if (serverProvider){
      Logger.getInstance().info("Creating new server instance for " + serverProvider.getProviderName()+"...")
      let instance = serverProvider.createInstance(configuration);
      let wrapper =  this.registerInstance(serverProvider.getProviderName(), serverProvider.id, instanceName, instance, configuration)
      EventBus.getInstance().publish(ServerManager.EVT_SERVER_INSTANCE_CREATED, wrapper);
      Logger.getInstance().info("New server instance created " + serverProvider.getProviderName()+" [instanceId:"+wrapper.instanceId+"].")
      return wrapper;
    } else {
      Logger.getInstance().error("Error creating new server instance for " + serverProvider.getProviderName()+": Provider not found.")
      throw ("Server Provider not found for '"+ providerId +"'.")
    }
  }

  private registerInstance(providerName:string, providerId:string, instanceName:string, serverInstance:ServerInstance, configuration:any):ServerInstanceWrapper {
    Logger.getInstance().debug("Registering new server instance for provider=" + providerName +"...")
    let wrapper = new ServerInstanceWrapper(providerName, instanceName, serverInstance, configuration)
    Logger.getInstance().debug("New server instance registered with id=" + wrapper.instanceId +".")
    this.instances.push(wrapper)
    GlobalPreferences.getInstance().then((preferences)=>{
      let instances = preferences.get('server.instances');
      if (!instances){
        instances = [];
      }
      let instancePrefs = {
        providerName: providerName,
        providerId: providerId,
        serverInstanceId: wrapper.instanceId,
        instanceName: wrapper.name,
        configuration: configuration
      }
      instances.push(instancePrefs)
      preferences.save('server.instances', instances)
      Logger.getInstance().debug("New server instance saved with id=" + wrapper.instanceId +".")
    })
    return wrapper;
  }

  public storeInstanceConfiguration(instanceId:string, configuration:any):Promise<any>{
    Logger.getInstance().debug("Saving server instance preferences for id=" + instanceId +"...")
    return new Promise((resolve,reject)=>{
      GlobalPreferences.getInstance().then((preferences)=>{
        let instances = preferences.get('server.instances');
        if (!instances){
          Logger.getInstance().error("Error saving server instance preferences for id=" + instanceId +": server instance preferences not found.")
          reject("No server instances defined.")
          return;
        }
        let instance = _.find(instances, { serverInstanceId : instanceId});
        if (!instance){
          reject("Server instance not found.")
          Logger.getInstance().error("Error saving server instance preferences for id=" + instanceId +": server instance not found.")
          return;
        }
        instance["configuration"] = configuration;
        preferences.save('server.instances', instances);
        Logger.getInstance().debug("Server instance preferences saved for id=" + instanceId +".")
        resolve(instanceId);
      }, (err)=>{
        reject(err)
      })
    });
  }

  private unregisterInstance(instanceWrapped:ServerInstanceWrapper){
    EventBus.getInstance().publish(ServerManager.EVT_SERVER_INSTANCE_REMOVED, instanceWrapped);
    instanceWrapped.destroy();
  }

  public getInstances():Array<ServerInstanceWrapper>{
      return this.instances;
  }

  public getInstancesForProvider(providerName:string):Array<ServerInstanceWrapper>{
      return _.filter(this.instances, { provider : providerName});
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



}
