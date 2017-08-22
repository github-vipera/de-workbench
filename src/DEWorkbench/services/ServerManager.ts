'use babel'

/*!
 * Dynamic Engine Workbench
 * Copyright(c) 2017 Dynamic Engine Team @ Vipera Plc
 * MIT Licensed
 */

import { Logger } from '../../logger/Logger'
import { CordovaPlugin } from '../../cordova/Cordova'
import { EventBus } from '../EventBus'

const _ = require('lodash');
const GUID = require('guid');


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
  private providers:Array<ServerProvider>
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

  public registerProvider(provider:ServerProvider){
    try {
      Logger.getInstance().debug("Registering Server Provider: ",provider)
      console.log("Registering Server Provider: ", provider)
      this.providers.push(provider)
      EventBus.getInstance().publish(ServerManager.EVT_PROVIDER_REGISTERED, provider);
    } catch (ex){
      Logger.getInstance().error("Error registering Server Provider: ", ex)
      console.error("Error registering Server Provider: ", ex)
    }
  }

  public getProviders():Array<ServerProvider>{
    return this.providers;
  }

  protected getProviderByName(providerName:string):ServerProvider {
      for (var i=0;i<this.providers.length;i++){
        if (this.providers[i].getProviderName()===providerName){
          return this.providers[i];
        }
      }
      return null;
  }

  public createServerInstance(providerName:string, instanceName:string, configuration:any):ServerInstanceWrapper{
    let serverProvider:ServerProvider = this.getProviderByName(providerName);
    if (serverProvider){
      let instance = serverProvider.createInstance(configuration);
      let wrapper =  this.registerInstance(providerName, instanceName, instance, configuration)
      EventBus.getInstance().publish(ServerManager.EVT_SERVER_INSTANCE_CREATED, wrapper);
      return wrapper;
    } else {
      throw ("Server Provider not found for '"+ providerName +"'.")
    }
  }

  private registerInstance(providerName:string, instanceName:string, serverInstance:ServerInstance, configuration:any):ServerInstanceWrapper {
    let wrapper = new ServerInstanceWrapper(providerName, instanceName, serverInstance, configuration)
    this.instances.push(wrapper)
    return wrapper;
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
