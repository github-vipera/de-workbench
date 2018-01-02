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
const interact = require("interactjs")

import { ProjectManager } from '../../../DEWorkbench/ProjectManager'
import { Logger } from '../../../logger/Logger'
import { UIComponent, UIBaseComponent } from '../../../ui-components/UIComponent'

export class UICDeviceViewport extends UIBaseComponent {

  private currentProjectRoot:string;
  private deviceCanvas:HTMLElement;

  constructor(){
      super();
      this.currentProjectRoot = ProjectManager.getInstance().getCurrentProjectPath();
      this.initUI();
  }

  protected initUI(){
    // Main element
    this.mainElement = createElement('div',{
        elements : [
          //createText("Device Viewport")
        ],
        className: 'de-wb-uic-device-viewport'
    })

    this.deviceCanvas = createElement('div',{
      elements: [],
      className: 'de-wb-uic-device-canvas'
    })
    insertElement(this.mainElement, this.deviceCanvas);


    interact(this.mainElement).dropzone({
      // only accept elements matching this CSS selector
     accept: '.de-wb-uic-component-placeholder',
     // Require a 75% element overlap for a drop to be possible
     overlap: 0.75,
     ondrop: (event)=> {
       //event.relatedTarget.textContent = 'Dropped';
       event.target.classList.remove('drop-target');
       event.relatedTarget.classList.remove('can-drop');
       event.relatedTarget.textContent = 'Dragged out';
     },
     ondropactivate: (event)=> {
        // add active dropzone feedback
        event.target.classList.add('drop-active');
      },
      ondragenter: (event)=> {
          var draggableElement = event.relatedTarget,
              dropzoneElement = event.target;

          // feedback the possibility of a drop
          dropzoneElement.classList.add('drop-target');
          draggableElement.classList.add('can-drop');
          draggableElement.textContent = 'Dragged in';
        },
        ondragleave: (event)=> {
          // remove the drop feedback style
          event.target.classList.remove('drop-target');
          event.relatedTarget.classList.remove('can-drop');
          event.relatedTarget.textContent = 'Dragged out';
        }
     });
   }

}
