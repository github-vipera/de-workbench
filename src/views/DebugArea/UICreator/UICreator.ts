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
   createTextEditor,
   createButtonSpacer
 } from '../../../element/index';

const _ = require("lodash");
const $ = require ('JQuery');

import { ProjectManager } from '../../../DEWorkbench/ProjectManager'
import { Logger } from '../../../logger/Logger'
import { UIComponent, UIBaseComponent } from '../../../ui-components/UIComponent'
import { UICToolbox } from './UICToolbox'
import { UICDeviceViewport } from './UICDeviceViewport'

export class UICCreator extends UIBaseComponent {

  private currentProjectRoot:string;
  private _toolbox:UICToolbox;
  private _deviceViewport:UICDeviceViewport;

  constructor(){
      super();
      this.currentProjectRoot = ProjectManager.getInstance().getCurrentProjectPath();
      this.initUI();
  }

  protected initUI(){
    // Main element
    this.mainElement = createElement('div',{
        elements : [
        ],
        className: 'de-wb-ui-creator'
    })

    this._toolbox = new UICToolbox();
    insertElement(this.mainElement, this._toolbox.element());

    
    this._deviceViewport = new UICDeviceViewport();
    insertElement(this.mainElement, this._deviceViewport.element());


  }

}
