'use babel'

/*!
 * Dynamic Engine Workbench
 * Copyright(c) 2017 Dynamic Engine Team @ Vipera Plc
 * MIT Licensed
 */

import { Logger } from '../../logger/Logger'
import { CordovaPlugin } from '../../cordova/Cordova'
import { EventBus } from '../EventBus'

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
  configure();
  addEventListener(event:string, listener);
  removeEventListener(event:string, listener);
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

  public createServerInstance(providerName:string, configuration:any):ServerInstanceWrapper{
    let serverProvider:ServerProvider = this.getProviderByName(providerName);
    if (serverProvider){
      let instance = serverProvider.createInstance(configuration);
      let wrapper =  this.registerInstance(instance)
      EventBus.getInstance().publish(ServerManager.EVT_SERVER_INSTANCE_CREATED, wrapper);
      return wrapper;
    } else {
      throw ("Server Provider not found for '"+ providerName +"'.")
    }
  }

  private registerInstance(serverInstance:ServerInstance):ServerInstanceWrapper {
    let wrapper = new ServerInstanceWrapper(serverInstance)
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

}


export class ServerInstanceWrapper implements ServerInstance {

  _serverInstance: ServerInstance;
  _instanceId: string;

  constructor(serverInstance: ServerInstance){
    this._instanceId = GUID.raw();
    this._serverInstance = serverInstance;
    this._serverInstance.addEventListener('onDidStatusChange',this.onDidStatusChange)
  }

  protected onDidStatusChange(evt){
    //TODO!!
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

  public configure(){
    this._serverInstance.configure();
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


}
