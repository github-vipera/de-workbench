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

export enum UIToggleButtonsMode {
    Checkbox,
    Radio
}

export class UIToggleButtons extends UIBaseComponent {

  private buttonGroup:HTMLElement;
  private toggleMode:UIToggleButtonsMode;
  private buttons:any;

  constructor(toggleMode:UIToggleButtonsMode){
    super();
    this.toggleMode = toggleMode;
    this.buildUI();
  }

  private buildUI(){
    this.buttons = {};

    this.buttonGroup = createElement('div',{
      elements: [
      ],
      className : 'de-workbench-ui-togglebuttons btn-group'
    })
    this.mainElement = this.buttonGroup;
  }

  public addButton(id:string, caption:string, selected:boolean, toggleListener?:Function):UIToggleButtons {
    let button = this.createButton(id, caption,selected, toggleListener);
    insertElement(this.buttonGroup, button);
    this.buttons[id] = { element: button, id: id, caption: caption };
    return this;
  }


  public toggleButton(id:string){
    this.buttons[id].element.classList.toggle('selected');
  }

  /**
   * Create a button for platform selection
   */
  private createButton(id:string, caption:string, selected:boolean, toggleListener?:Function):HTMLElement {
    let className = "btn platform-select";
    if (selected){
       className += ' selected';
    }
    let btn:HTMLElement = createElement('button',{
      elements: [
        createText(caption)
      ],
      className: className
    })
    btn.setAttribute('toggle-id',id)
    btn.addEventListener('click',(evt)=>{
      let el:any = evt.currentTarget;
      el.classList.toggle('selected');
      if (toggleListener){
        toggleListener(id);
      }
    });
    return btn;
  }


}
