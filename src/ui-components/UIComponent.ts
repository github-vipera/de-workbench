'use babel'

/*!
 * Dynamic Engine Workbench
 * Copyright(c) 2017 Dynamic Engine Team @ Vipera Plc
 * MIT Licensed
 */

export interface UIComponent {
  element():HTMLElement
}

const uuidv4 = require('uuid/v4');

export class UIBaseComponent implements UIComponent {

  protected mainElement: HTMLElement;
  protected uiComponentId: string;

  constructor(){
    this.uiComponentId = uuidv4();
  }

  public element(){
    return this.mainElement;
  }

  public uiComponentID(){
    return this.uiComponentId;
  }

  public destroy () {
    this.mainElement.remove();
  }


}
