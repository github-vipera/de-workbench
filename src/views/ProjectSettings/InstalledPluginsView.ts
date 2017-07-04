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

export class InstalledPluginsView {

  private mainElement: HTMLElement;
  private pluginList: UIPluginsList;

  constructor(){
    this.buildUI();
  }

  private buildUI(){
    this.pluginList = new UIPluginsList();

    let listContainer = createElement('div',{
        elements : [
          this.pluginList.element()
        ]
    })

    this.mainElement = createElement('div',{
      elements : [
        listContainer
      ]
    });
    
  }

  public element():HTMLElement {
    return this.mainElement;
  }
}
