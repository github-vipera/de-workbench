'use babel'

/*!
 * Dynamic Engine Workbench
 * Copyright(c) 2017 Dynamic Engine Team @ Vipera Plc
 * MIT Licensed
 */

import { Logger } from '../../logger/Logger'
import { CordovaPlugin } from '../../cordova/Cordova'

export interface CordovaPluginsProviderFactory {
  createProvider():CordovaPluginsProviderService;
}

export interface CordovaPluginsProviderService {
  getCordovaPlugins():Promise<Array<CordovaPlugin>>;
  getProviderName():string;
  getExtendedUI():HTMLElement;
  addEventHandler(handler:Function);
}

export class CordovaPluginsProvidersManager {

  private static instance:CordovaPluginsProvidersManager;
  private providerFactories:Array<CordovaPluginsProviderFactory>

  private constructor() {
    Logger.getInstance().debug("Creating CordovaPluginsProvidersManager...")
    this.providerFactories = [];
  }

  static getInstance() {
      if (!CordovaPluginsProvidersManager.instance) {
          CordovaPluginsProvidersManager.instance = new CordovaPluginsProvidersManager();
      }
      return CordovaPluginsProvidersManager.instance;
  }

  public registerProviderFactory(providerFactory:CordovaPluginsProviderFactory){
    try {
      Logger.getInstance().debug("Registering Cordova Plugins Provider Factory: ",providerFactory)
      Logger.consoleLog("Registering Cordova Plugins Provider: ", providerFactory)
      this.providerFactories.push(providerFactory)
    } catch (ex){
      Logger.getInstance().error("Error registering Cordova Plugins Provider: ", ex)
      console.error("Error registering Cordova Plugins Provider: ", ex)
    }
  }

  public getProviderFactories():Array<CordovaPluginsProviderFactory>{
    return this.providerFactories;
  }

}
