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


export class UIListView {

  private mainElement:HTMLElement;

  constructor(){
    this.buildUI();
  }

  private buildUI(){
    this.mainElement =  createElement('div', {
        elements: [
                   ],
        className:"de-workbench-listview"
    })
  }

  public element(){
    return this.mainElement;
  }


}
