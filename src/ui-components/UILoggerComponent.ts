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

import { UIComponent, UIBaseComponent } from './UIComponent'

export class UILoggerComponent extends UIBaseComponent {


  constructor(){
      super();
      this.buildUI();
  }

  private buildUI(){
    this.mainElement = createElement('div',{
      elements: [
        createText("Here the log")
      ],
      className: "de-workbench-uilogger-container"
    })
  }


  public addLog(message:string, className?:string):UILoggerComponent{
    let el = this.createLogLineElement(message, className);
    this.mainElement.appendChild(el);
    this.updateScroll();
    return this;
  }

  private createLogLineElement(message:string, className?:string):HTMLElement {
    return createElement('div',{
      elements: [
        createElement('div',{
          elements : [
            createText(message)
          ],
          className: "de-workbench-uilogger-logline-message"
        })
      ],
      className: "de-workbench-uilogger-logline " + (className?className:'')
    })
  }

  public updateScroll(){
    this.mainElement.scrollTop = this.mainElement.scrollHeight;
  }

}
