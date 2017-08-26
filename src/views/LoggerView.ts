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
import { Logger,LoggerListener ,LogLevel} from '../logger/Logger'
import { UILoggerComponent,LogLine, IFilterableModel ,FileTailLogModel } from '../ui-components/UILoggerComponent'
import { UIPane } from '../ui-components/UIPane'

export class LoggerView extends UIPane {

  private events: EventEmitter
  //private panel: any
  //private item: any;
  //private atomWorkspace:any;
  private logModel:FileTailLogModel;
  private loggerComponent:UILoggerComponent;

  constructor (params:any) {
    super(params)
    //Logger.getInstance().info("LoggerView initializing...");
    //this.initUI();
    //this.bindWithLogger();
  }

  /**
   * Initialize the UI
   */
  protected createUI() {
    //this.atomWorkspace = atom.workspace;
    this.events = new EventEmitter()
    this.logModel = new FileTailLogModel(Logger.getLoggerBufferFilePath(),10);

    //Logger.getInstance().debug("LoggerView initUI called...");
    this.loggerComponent = new UILoggerComponent(true,this.logModel);
    // Create the main UI
    let element = createElement('div',{
      elements : [
      ]
    });
    insertElement(element, this.loggerComponent.element());

    return element;
  }

  /**
   * Open this view
   */
   /**
  open () {
    //Logger.getInstance().debug("LoggerView open called...");
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
  **/

  /**
   * close this view
   */
  close () {
    //this.panel.hide();
  }

  destroy(){
    //this.panel.hide();
    this.logModel.destroy();
  }

}
