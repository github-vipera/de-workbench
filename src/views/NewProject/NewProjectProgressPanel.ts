'use babel'

/*!
 * Dynamic Engine Workbench
 * Copyright(c) 2017 Dynamic Engine Team @ Vipera Plc
 * MIT Licensed
 */

 import {
   createText,
   createLabel,
   createBlock,
   createElement,
   insertElement,
   createGroupButtons,
   createButton,
   createIcon,
   createIconFromPath,
   attachEventFromObject,
   createTextEditor,
   createControlBlock
 } from '../../element/index';

import { EventEmitter }  from 'events'
import { UIButtonGroup, UIButtonConfig, UIButtonGroupMode } from '../../ui-components/UIButtonGroup'
import { UITextEditorExtended } from '../../ui-components/UITextEditorExtended'
import { DEWBResourceManager } from "../../DEWorkbench/DEWBResourceManager"
import { UIBaseComponent, UIComponent } from '../../ui-components/UIComponent'
import { UISelect, UISelectItem } from '../../ui-components/UISelect'
import { UILoggerComponent } from '../../ui-components/UILoggerComponent'
import { Logger,LoggerListener ,LogLevel} from '../../logger/Logger'


export class NewProjectProgressPanel extends UIBaseComponent implements LoggerListener {

  private logOverlayElement:HTMLElement;
  private loggerComponent: UILoggerComponent;
  private started:boolean;

  constructor(){
    super();
    this.initUI();
  }

  protected initUI(){
    // Create Logger Overlay
    this.logOverlayElement = createElement('div',{
        className : 'de-workbench-newproj-logger-overlay'
    });

    this.loggerComponent = new UILoggerComponent();
    this.loggerComponent.element().classList.add('de-workbench-newproj-logger-component')
    insertElement(this.logOverlayElement, this.loggerComponent.element())

    let progressLineContainer = createElement('div',{
      elements: [
        createElement('progress',{
          className: 'de-workbench-newproj-logger-progressline'
        })
      ],
      className: 'de-workbench-newproj-logger-progressline-container'
    })
    insertElement(this.logOverlayElement, progressLineContainer)

    this.mainElement = this.logOverlayElement;
    //private loggerComponent: UILoggerComponent;

    this.bindWithLogger();
  }

  private bindWithLogger(){
    console.log("bindWithLogger");
    Logger.getInstance().addLoggingListener(this);
    Logger.getInstance().debug("LoggerView -> bind with log done");
  }

  onLogging(level:LogLevel, msg:string){
    if (this.started){
      this.loggerComponent.addLog(msg,level);
    }
  }


  public destroy(){
    super.destroy();
  }

  public show(){
    this.mainElement.style.display = "initial"
  }

  public hide(){
    this.mainElement.style.display = "none"
  }

  public startLog(){
    this.started = true;
  }

  public stopLog(){
    this.started = false;
  }

}
