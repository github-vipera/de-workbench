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

  private logModel:FileTailLogModel;
  private loggerComponent:UILoggerComponent;

  constructor (params:any) {
    super(params)
  }

  /**
   * Initialize the UI
   */
  protected createUI() {
    this.logModel = new FileTailLogModel(Logger.getLoggerBufferFilePath(),10);

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
   * close this view
   */
  close () {
    //console.log("Logger view close....")
  }

  destroy(){
    //console.log("Logger view destroy....")
    //this.logModel.destroy();
  }

}
