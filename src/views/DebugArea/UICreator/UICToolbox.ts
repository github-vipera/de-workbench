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

export class UICToolbox extends UIBaseComponent {

  private currentProjectRoot:string;

  constructor(){
      super();
      this.currentProjectRoot = ProjectManager.getInstance().getCurrentProjectPath();
      this.initUI();
  }

  protected initUI(){
    // Main element
    this.mainElement = createElement('div',{
        elements : [
          //createText("Toolbox")
        ],
        className: 'de-wb-uic-toolbox'
    })

    let simpleControl = createElement('div',{
      elements: [ createText('Component')],
      className: 'de-wb-uic-component-placeholder'
    })
    insertElement(this.mainElement, simpleControl);

    interact(simpleControl)
      .draggable({
        // call this function on every dragmove event
        onmove: (event)=>{
          var target = event.target,
                 // keep the dragged position in the data-x/data-y attributes
                 x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
                 y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

             // translate the element
             target.style.webkitTransform =
             target.style.transform =
               'translate(' + x + 'px, ' + y + 'px)';

             // update the posiion attributes
             target.setAttribute('data-x', x);
             target.setAttribute('data-y', y);
        },
      })
      .resizable({
        inertia: true
      });

  }

}
