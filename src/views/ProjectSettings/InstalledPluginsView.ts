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
import { UIPluginsList } from '../../ui-components/UIPluginsList'
import { UIStackedView } from '../../ui-components/UIStackedView'

export class InstalledPluginsView {

  private mainElement: HTMLElement;
  private pluginList: UIPluginsList;
  private stackedPage: UIStackedView;

  constructor(){
    this.buildUI();

    let currentProjectRoot = ProjectManager.getInstance().getCurrentProjectPath();
    let cordova:Cordova = ProjectManager.getInstance().cordova;

    cordova.getInstalledPlugins(currentProjectRoot).then((installedPlugins:Array<CordovaPlugin>)=>{
      this.pluginList.addPlugins(installedPlugins);
    });

  }

  private buildUI(){
    this.pluginList = new UIPluginsList();
    let listContainer = createElement('div',{
        elements : [
          this.pluginList.element()
        ]
    })

    this.stackedPage = new UIStackedView()
                        .setTitle('Installed Plugins')
                        .setInnerView(listContainer);

    this.mainElement = this.stackedPage.element();

  }

  public element():HTMLElement {
    return this.mainElement;
  }
}
