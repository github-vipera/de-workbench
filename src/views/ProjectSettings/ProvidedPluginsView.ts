'use babel'

/*!
 * Dynamic Engine Workbench
 * Copyright(c) 2017 Dynamic Engine Team @ Vipera Plc
 * MIT Licensed
 */

 import {
   createText,
   createElement,
   insertElement,
   createGroupButtons,
   createButton,
   createIcon,
   createIconFromPath,
   attachEventFromObject,
   createTextEditor,
   createButtonSpacer
 } from '../../element/index';

const _ = require("lodash");
const $ = require ('JQuery');

import { ProjectManager } from '../../DEWorkbench/ProjectManager'
import { Cordova, CordovaPlatform, CordovaPlugin } from '../../cordova/Cordova'
import { Logger } from '../../logger/Logger'
import { UIPluginsList, UIPluginMetaButtons } from '../../ui-components/UIPluginsList'
import { UITabbedView, UITabbedViewItem, UITabbedViewTabType } from '../../ui-components/UITabbedView'
import { UIComponent, UIBaseComponent } from '../../ui-components/UIComponent'
import { UILineLoader } from '../../ui-components/UILineLoader'
import { UINotifications } from '../../ui-components/UINotifications'
import { EventBus } from '../../DEWorkbench/EventBus'
import { CordovaPluginsProviderService } from '../../DEWorkbench/services/CordovaPluginsProvidersManager'

export class ProvidedPluginsView extends UIBaseComponent {

  private pluginList: UIPluginsList;
  private lineLoader:UILineLoader;
  private currentProjectRoot:string;
  private pluginsProvider:CordovaPluginsProviderService;
  private extendedUIContainer: HTMLElement;

  constructor(){
    super();

    this.currentProjectRoot = ProjectManager.getInstance().getCurrentProjectPath();

    this.initUI();

  }

  protected initUI(){

    // Subscribe interesting events
    EventBus.getInstance().subscribe(EventBus.EVT_PLUGIN_ADDED, (eventData)=>{
      // the first item in eventData is the project root
      if (eventData[0]===this.currentProjectRoot){
        //TODO!! check for installed
      }
    });
    EventBus.getInstance().subscribe(EventBus.EVT_PLUGIN_REMOVED, (eventData)=>{
      // the first item in eventData is the project root
      if (eventData[0]===this.currentProjectRoot){
        //TODO!! check for installed
      }
    });
    // end event bus subscription

    this.lineLoader = new UILineLoader()

    // Plugins list
    this.pluginList = new UIPluginsList().setEventListener((pluginInfo, actionType)=>{
      if (actionType===UIPluginMetaButtons.BTN_TYPE_INSTALL){
        this.doInstallPlugin(pluginInfo)
      }
      else if (actionType===UIPluginMetaButtons.BTN_TYPE_UNINSTALL){
        this.doUninstallPlugin(pluginInfo)
      } else {
        Logger.getInstance().warn("Action unknwon " + actionType);
      }
    });


    this.extendedUIContainer = createElement('div',{
      className:'de-workbench-provided-plugins-extui-container'
    });

    // Main element
    this.mainElement = createElement('div',{
        elements : [  this.extendedUIContainer, this.pluginList.element(), this.lineLoader.element() ],
        className: 'de-workbench-community-plugins-list'
    })

    this.showProgress(false);

  }

  private doInstallPlugin(pluginInfo){
    this.showProgress(true)
    this.pluginList.setPluginInstallPending(pluginInfo, true);
    ProjectManager.getInstance().cordova.addPlugin(this.currentProjectRoot, pluginInfo).then(()=>{
      UINotifications.showInfo("Plugin "+pluginInfo.name +" installed successfully.")
      this.showProgress(false)
      this.pluginList.setPluginInstallPending(pluginInfo, false);
    }).catch(()=>{
      UINotifications.showError("Error installing plugin "+pluginInfo.name +". See the log for more details.")
      this.showProgress(false)
      this.pluginList.setPluginInstallPending(pluginInfo, false);
    })
  }

  private doUninstallPlugin(pluginInfo){
    this.showProgress(true)
    this.pluginList.setPluginUInstallPending(pluginInfo, true);
    ProjectManager.getInstance().cordova.removePlugin(this.currentProjectRoot, pluginInfo).then(()=>{
      UINotifications.showInfo("Plugin "+pluginInfo.name +" uninstalled successfully.")
      this.showProgress(false)
      this.pluginList.setPluginUInstallPending(pluginInfo, false);
    }).catch(()=>{
      UINotifications.showError("Error uninstalling plugin "+pluginInfo.name +". See the log for more details.")
      this.showProgress(false)
      this.pluginList.setPluginUInstallPending(pluginInfo, false);
    })
  }

  private markInstalledPlugins(pluginList:Array<CordovaPlugin>, installedPlugins:Array<CordovaPlugin>):Array<CordovaPlugin>{
      for (var i=0;i<installedPlugins.length;i++){
        let index = _.findIndex(pluginList, { 'name' : installedPlugins[i].name })
        if (index>-1){
          pluginList[index].installed = true
        }
      }
      return pluginList;
  }

  /*
   * Show/Hide progress bar
   */
  private showProgress(show:boolean){
    this.lineLoader.setOnLoading(show);
  }

  public destroy(){
    this.pluginList.destroy()
    super.destroy()
  }

  public setPluginsProvider(provider:CordovaPluginsProviderService):ProvidedPluginsView {
    this.pluginsProvider = provider;
    this.pluginsProvider.addEventHandler((event)=>{
      if (event && event.type && event.type ==='listChanged'){
        this.reloadPluginList();
      }
    })

    if (this.pluginsProvider.getExtendedUI){
        let extendedUIElement = this.pluginsProvider.getExtendedUI();
        if (extendedUIElement){
          insertElement(this.extendedUIContainer, extendedUIElement)
        }
    }


    return this;
  }

  public reloadPluginList():ProvidedPluginsView{
    try {
      this.pluginsProvider.getCordovaPlugins().then((providedPluginsList)=>{
        this.pluginList.setPlugins(providedPluginsList);
      });
      return this;
    } catch(ex){
      Logger.getInstance().error("Error loading plugins list from provider "+ this.pluginsProvider +": " + ex,ex)
      console.error("Error loading plugins list from provider "+ this.pluginsProvider +": " + ex,ex)
    }
  }

}
