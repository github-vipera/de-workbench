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

export class InstalledPluginsView  extends UIBaseComponent {

  private pluginList: UIPluginsList;
  private stackedPage: UIStackedView;
  private lineLoader:UILineLoader;

  constructor(){
    super();
    this.buildUI();

    let currentProjectRoot = ProjectManager.getInstance().getCurrentProjectPath();
    let cordova:Cordova = ProjectManager.getInstance().cordova;

    cordova.getInstalledPlugins(currentProjectRoot).then((installedPlugins:Array<CordovaPlugin>)=>{
      this.pluginList.addPlugins(installedPlugins);
    });

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
    /**
    ProjectManager.getInstance().cordova.addPlugin(this.currentProjectRoot, pluginInfo).then(()=>{
      UINotifications.showInfo("Plugin "+pluginInfo.name +" installed successfully.")
      this.showProgress(false)
      this.pluginList.setPluginUInstallPending(pluginInfo, false);
    }).catch(()=>{
      UINotifications.showInfo("Error installing plugin "+pluginInfo.name +". See the log for more details.")
      this.showProgress(false)
      this.pluginList.setPluginUInstallPending(pluginInfo, false);
    })
    **/
  }
}
