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
 } from '../element/index';

import { EventEmitter }  from 'events'
import { CordovaUtils } from '../cordova/CordovaUtils'
import { ProjectManager } from '../DEWorkbench/ProjectManager'
import { Cordova, CordovaPlatform, CordovaPlugin } from '../cordova/Cordova'
import { UIListView, UIListViewModel } from '../ui-components/UIListView'
import { ProjectTypePanel } from '../ui-components/ProjectTypePanel'
import { Logger } from '../logger/Logger'
import { UILoggerComponent } from '../ui-components/UILoggerComponent'

export class LoggerView {

  private element: HTMLElement
  private events: EventEmitter
  private panel: any
  private item: any;
  private atomWorkspace:any;
  private loggerComponent:UILoggerComponent;

  constructor () {
    Logger.getInstance().debug("LoggerView initializing...");

    this.atomWorkspace = atom.workspace;
    this.events = new EventEmitter()

    this.initUI();

  }

  /**
   * Initialize the UI
   */
  initUI() {
    Logger.getInstance().debug("LoggerView initUI called...");

    this.loggerComponent = new UILoggerComponent();

    // Create the main UI
    this.element = createElement('div',{
      elements : [
      ]
    });

    insertElement(this.element, this.loggerComponent.element());

    this.loggerComponent.addLog("LoggerView initUI done.")
    this.loggerComponent.addLog("Another Log line.")
    this.loggerComponent.addLog("Hello World!!")
    for (var i=0;i<50;i++){
      this.loggerComponent.addLog("This is the line " + i)
    }

    setInterval(()=>{
      this.loggerComponent.addLog("This is the line " + new Date() )
    }, 3000);

    Logger.getInstance().debug("LoggerView initUI done.");
  }

  /**
   * Open this view
   */
  open () {
    Logger.getInstance().debug("LoggerView open called...");
    if (this.item){
      this.atomWorkspace.toggle(this.item);
    } else {
      const  prefix = "dewb";
      const uri = prefix + '//' + '_loggerview';
      this.item = {
        activatePane: true,
        searchAllPanes: true,
        location: 'bottom',
        element: this.element,
        getTitle: () => 'DE Workbench Log Inspector',
        getURI: () => uri,
        getDefaultLocation: () => 'bottom',
        getAllowedLocations: () => ['bottom', 'top', 'left', 'right']
      };
      this.atomWorkspace.open(this.item).then((view)=>{
        this.loggerComponent.updateScroll();
      });
    }
  }

  /**
   * close this view
   */
  close () {
    this.panel.hide()
  }

}
