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
   createTextEditor
 } from '../../element/index';

import { EventEmitter }  from 'events'
import { ProjectManager } from '../../DEWorkbench/ProjectManager'
import { Cordova, CordovaPlatform, CordovaPlugin } from '../../cordova/Cordova'
import { Logger } from '../../logger/Logger'
import { UIPluginsList, UIPluginMetaButtons } from '../../ui-components/UIPluginsList'
import { UIStackedView } from '../../ui-components/UIStackedView'
import { UIComponent, UIBaseComponent } from '../../ui-components/UIComponent'
import { UILineLoader } from '../../ui-components/UILineLoader'
import { UINotifications } from '../../ui-components/UINotifications'
import { EventBus } from '../../DEWorkbench/EventBus'

export class InstalledPluginsView  extends UIBaseComponent {

  private pluginList: UIPluginsList;
  private stackedPage: UIStackedView;
  private lineLoader:UILineLoader;
  private currentProjectRoot:string;

  constructor(){
    super();

    this.currentProjectRoot = ProjectManager.getInstance().getCurrentProjectPath();

    this.buildUI();


    // Subscribe interesting events
    EventBus.getInstance().subscribe(EventBus.EVT_PLUGIN_ADDED, (eventData)=>{
      // the first item in eventData is the project root
      if (eventData[0]===this.currentProjectRoot){
        this.reload()
      }
    });
    EventBus.getInstance().subscribe(EventBus.EVT_PLUGIN_REMOVED, (eventData)=>{
      // the first item in eventData is the project root
      if (eventData[0]===this.currentProjectRoot){
        this.reload()
      }
    });
    // end event bus subscription

    this.reload();
  }

  private buildUI(){
    this.lineLoader = new UILineLoader()

    this.pluginList = new UIPluginsList()
                            .setLastUpdateVisible(false)
                            .setRatingVisible(false)
                            .setPlatformsVisible(false)
      .setEventListener((pluginInfo, actionType)=>{
        if (actionType===UIPluginMetaButtons.BTN_TYPE_INSTALL){
          // not possible to do this in this view !!!
        }
        else if (actionType===UIPluginMetaButtons.BTN_TYPE_UNINSTALL){
          this.doUninstallPlugin(pluginInfo)
        } else {
          Logger.getInstance().warn("Action unknwon " + actionType);
        }
      });



    let listContainer = createElement('div',{
        elements : [
          this.pluginList.element(),
          this.lineLoader.element()
        ]
    })

    this.stackedPage = new UIStackedView()
                        .setTitle('Installed Plugins')
                        .setInnerView(listContainer);

    this.mainElement = this.stackedPage.element();

    this.showProgress(false);
  }

  /*
   * Show/Hide progress bar
   */
  private showProgress(show:boolean){
    this.lineLoader.setOnLoading(show);
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

  public reload(){
    ProjectManager.getInstance().cordova.getInstalledPlugins(this.currentProjectRoot).then((installedPlugins:Array<CordovaPlugin>)=>{
      this.pluginList.clearList();
      this.pluginList.addPlugins(installedPlugins);
    });
  }
}
