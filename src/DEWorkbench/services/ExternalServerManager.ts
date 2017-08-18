'use babel'

/*!
 * Dynamic Engine Workbench
 * Copyright(c) 2017 Dynamic Engine Team @ Vipera Plc
 * MIT Licensed
 */

import { Logger } from '../../logger/Logger'
import { CordovaPlugin } from '../../cordova/Cordova'


export enum ServerStatus {
  Stopped = 0,
  Starting,
  Running,
  Stopping
}

export interface ExternalServerInstance {
  start();
  stop();
  status:ServerStatus;
  configure();
}

export interface ExternalServerProvider {
  createInstance(configuration:any):ExternalServerInstance;
  getProviderName():string;
}

export class ExternalServerManager {

  private static instance:ExternalServerManager;
  private providers:Array<ExternalServerProvider>
  private instances:Array<ExternalServerInstance>

  private constructor() {
    Logger.getInstance().debug("Creating ExternalServerManager...")
    this.providers = [];
    this.instances = [];
  }

  static getInstance() {
      if (!ExternalServerManager.instance) {
          ExternalServerManager.instance = new ExternalServerManager();
      }
      return ExternalServerManager.instance;
  }

  public registerProvider(provider:ExternalServerProvider){
    try {
      Logger.getInstance().debug("Registering Server Provider: ",provider)
      console.log("Registering Server Provider: ", provider)
      this.providers.push(provider)
    } catch (ex){
      Logger.getInstance().error("Error registering Server Provider: ", ex)
      console.error("Error registering Server Provider: ", ex)
    }
  }

  public getProviders():Array<ExternalServerProvider>{
    return this.providers;
  }

  protected getProviderByName(providerName:string):ExternalServerProvider {
      for (var i=0;i<this.providers.length;i++){
        if (this.providers[i].getProviderName()===providerName){
          return this.providers[i];
        }
      }
      return null;
  }

  public createServerInstance(providerName:string, configuration:any):ExternalServerInstance{
    let serverProvider:ExternalServerProvider = this.getProviderByName(providerName);
    if (serverProvider){
      let instance = serverProvider.createInstance(configuration);
      this.instances.push(instance)
      return instance;
    } else {
      throw ("Server Provider not found for '"+ providerName +"'.")
    }
  }


}
