'use babel'

/*!
 * Dynamic Engine Workbench
 * Copyright(c) 2017 Dynamic Engine Team @ Vipera Plc
 * MIT Licensed
 */

import { Logger } from '../../logger/Logger'
import { CordovaPlugin } from '../../cordova/Cordova'

export interface CordovaPluginsProviderService {
  getCordovaPlugins():Array<CordovaPlugin>;
  getProviderName():string;
  getExtendedUI():HTMLElement;
}

export class CordovaPluginsProvidersManager {

  private static instance:CordovaPluginsProvidersManager;
  private providers:Array<CordovaPluginsProviderService>

  private constructor() {
    Logger.getInstance().debug("Creating CordovaPluginsProvidersManager...")
    this.providers = [];
  }

  static getInstance() {
      if (!CordovaPluginsProvidersManager.instance) {
          CordovaPluginsProvidersManager.instance = new CordovaPluginsProvidersManager();
      }
      return CordovaPluginsProvidersManager.instance;
  }

  public registerProvider(provider:CordovaPluginsProviderService){
    try {
      Logger.getInstance().debug("Registering Cordova Plugins Provider: ", provider.getProviderName())
      console.log("Registering Cordova Plugins Provider: ", provider.getProviderName())
      this.providers.push(provider)
    } catch (ex){
      Logger.getInstance().error("Error registering Cordova Plugins Provider: ", ex)
      console.error("Error registering Cordova Plugins Provider: ", ex)
    }
  }

  public getProviders():Array<CordovaPluginsProviderService>{
    return this.providers;
  }

}
